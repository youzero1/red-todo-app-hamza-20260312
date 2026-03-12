import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database';
import { Todo } from '@/entities/Todo';

interface RouteParams {
  params: { id: string };
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await request.json();
    const { title, description, completed } = body;

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return NextResponse.json(
          { error: 'Title must be a non-empty string' },
          { status: 400 }
        );
      }
      if (title.trim().length > 255) {
        return NextResponse.json(
          { error: 'Title must be 255 characters or less' },
          { status: 400 }
        );
      }
    }

    if (description !== undefined && description !== null && typeof description !== 'string') {
      return NextResponse.json(
        { error: 'Description must be a string or null' },
        { status: 400 }
      );
    }

    if (completed !== undefined && typeof completed !== 'boolean') {
      return NextResponse.json(
        { error: 'Completed must be a boolean' },
        { status: 400 }
      );
    }

    const ds = await getDataSource();
    const todoRepo = ds.getRepository(Todo);
    const todo = await todoRepo.findOne({ where: { id } });

    if (!todo) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }

    if (title !== undefined) todo.title = title.trim();
    if (description !== undefined) todo.description = description ? description.trim() : null;
    if (completed !== undefined) todo.completed = completed;

    const updated = await todoRepo.save(todo);
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('PUT /api/todos/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update todo' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const ds = await getDataSource();
    const todoRepo = ds.getRepository(Todo);
    const todo = await todoRepo.findOne({ where: { id } });

    if (!todo) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }

    await todoRepo.remove(todo);
    return NextResponse.json({ data: { message: 'Todo deleted successfully' } });
  } catch (error) {
    console.error('DELETE /api/todos/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete todo' },
      { status: 500 }
    );
  }
}
