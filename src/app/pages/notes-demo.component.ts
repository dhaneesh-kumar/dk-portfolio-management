import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnhancedNotesComponent, Note } from '../shared/components/enhanced-notes/enhanced-notes.component';

@Component({
  selector: 'app-notes-demo',
  standalone: true,
  imports: [CommonModule, EnhancedNotesComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div class="max-w-4xl mx-auto">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-slate-900 mb-2">Enhanced Notes Demo</h1>
          <p class="text-slate-600">Test the new enhanced notes component with rich text editing and multiple notes per section.</p>
        </div>

        <app-enhanced-notes
          [notes]="demoNotes()"
          (noteAdded)="onNoteAdded($event)"
          (noteUpdated)="onNoteUpdated($event)"
          (noteDeleted)="onNoteDeleted($event)"
        ></app-enhanced-notes>

        <div class="mt-8 p-4 bg-white rounded-lg border border-slate-200">
          <h3 class="font-semibold text-slate-900 mb-2">Demo Features:</h3>
          <ul class="list-disc list-inside text-sm text-slate-600 space-y-1">
            <li>Multiple notes per section</li>
            <li>Rich text editor with formatting options</li>
            <li>Collapsible sections</li>
            <li>Quick section templates</li>
            <li>Edit and delete functionality</li>
            <li>Date tracking</li>
          </ul>
        </div>
      </div>
    </div>
  `
})
export class NotesDemoComponent {
  demoNotes = signal<Note[]>([
    {
      id: '1',
      section: 'Why I Bought',
      content: '<p>This is a <strong>sample note</strong> with <em>rich text formatting</em>.</p><ul><li>Strong financials</li><li>Growing market share</li><li>Experienced management team</li></ul>',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: '2',
      section: 'Why I Bought',
      content: '<p>Another note in the same section with different analysis:</p><blockquote>The company has shown consistent revenue growth over the past 5 years.</blockquote>',
      createdAt: new Date('2024-01-16'),
      updatedAt: new Date('2024-01-16')
    },
    {
      id: '3',
      section: 'Risk Assessment',
      content: '<h3>Key Risks to Monitor</h3><ol><li>Market volatility</li><li>Regulatory changes</li><li>Competition pressure</li></ol><p>Overall risk level: <strong>Medium</strong></p>',
      createdAt: new Date('2024-01-17'),
      updatedAt: new Date('2024-01-17')
    }
  ]);

  onNoteAdded(noteData: { section: string; content: string }) {
    const newNote: Note = {
      id: Date.now().toString(),
      section: noteData.section,
      content: noteData.content,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.demoNotes.update(notes => [...notes, newNote]);
    console.log('Note added:', newNote);
  }

  onNoteUpdated(noteData: { id: string; section: string; content: string }) {
    this.demoNotes.update(notes => 
      notes.map(note => 
        note.id === noteData.id 
          ? { ...note, section: noteData.section, content: noteData.content, updatedAt: new Date() }
          : note
      )
    );
    console.log('Note updated:', noteData);
  }

  onNoteDeleted(noteId: string) {
    this.demoNotes.update(notes => notes.filter(note => note.id !== noteId));
    console.log('Note deleted:', noteId);
  }
}
