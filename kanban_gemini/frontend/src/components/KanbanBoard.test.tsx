import { render, screen } from '@testing-library/react';
import { KanbanBoard } from './KanbanBoard';

describe('KanbanBoard', () => {
  it('renders default columns', () => {
    render(<KanbanBoard />);
    
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
    expect(screen.getByText('Archived')).toBeInTheDocument();
  });

  it('renders default cards', () => {
    render(<KanbanBoard />);
    
    expect(screen.getByText('Design user interface')).toBeInTheDocument();
    expect(screen.getByText('Set up project scaffolding')).toBeInTheDocument();
    expect(screen.getByText('Implement drag and drop')).toBeInTheDocument();
  });
});
