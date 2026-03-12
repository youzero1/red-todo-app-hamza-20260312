import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database';
import { Todo } from '@/entities/Todo';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const ds = await getDataSource();
    const todoRepo = ds.getRepository(Todo);
    const todos = await todoRepo.find({
      order: { createdAt: 'DESC' }
    });
    return NextResponse.json({ data: todos });
  } catch (error) {
    console.error('GET /api/todos error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch todos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (title.trim().length > 255) {
      return NextResponse.json(
        { error: 'Title must be 255 characters or less' },
        { status: 400 }
      );
    }

    if (description !== undefined && description !== null && typeof description !== 'string') {
      return NextResponse.json(
        { error: 'Description must be a string' },
        { status: 400 }
      );
    }

    const ds = await getDataSource();
    const todoRepo = ds.getRepository(Todo);

    const todo = new Todo();
    todo.id = uuidv4();
    todo.title = title.trim();
    todo.description = description ? description.trim() : null;
    todo.completed = false;

    const saved = await todoRepo.save(todo);
    return NextResponse.json({ data: saved }, { status: 201 });
  } catch (error) {
    console.error('POST /api/todos error:', error);
    return NextResponse.json(
      { error: 'Failed to create todo' },
      { status: 500 }
    );
  }
}
