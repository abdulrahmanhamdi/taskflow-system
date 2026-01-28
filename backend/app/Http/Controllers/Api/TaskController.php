<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        if (strtolower((string) $user->role) === 'admin') {
            $tasks = Task::with('user')->get();
        } else {
            $tasks = Task::with('user')
                ->where('user_id', $user->id)
                ->get();
        }

        return response()->json($tasks);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $task = Auth::user()->tasks()->create($validated);

        return response()->json($task, 201);
    }

    public function update(Request $request, Task $task)
    {
        $user = Auth::user();

        if (
            $task->user_id !== $user->id
            && strtolower((string) $user->role) !== 'admin'
        ) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $task->update($request->only(['title', 'description', 'status']));

        return response()->json($task);
    }

    public function destroy(Task $task)
    {
        $user = Auth::user();

        if (
            $task->user_id !== $user->id
            && strtolower((string) $user->role) !== 'admin'
        ) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $task->delete();

        return response()->json(['message' => 'Task deleted successfully']);
    }
}