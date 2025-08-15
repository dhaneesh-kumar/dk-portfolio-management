import { Component, Input, Output, EventEmitter, signal, computed, OnInit, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';

export interface Note {
  id: string;
  section: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  authorId?: string;
  authorEmail?: string;
}

export interface NoteSection {
  name: string;
  notes: Note[];
  isExpanded: boolean;
}

@Component({
  selector: 'app-enhanced-notes',
  standalone: true,
  imports: [CommonModule, FormsModule, QuillModule],
  template: `
    <div class="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-slate-900">Personal Notes</h2>
        <button
          (click)="showAddNoteModal.set(true)"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <svg class="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Note
        </button>
      </div>

      @if (noteSections().length > 0) {
        <div class="space-y-4">
          @for (section of noteSections(); track section.name) {
            <div class="border border-slate-200 rounded-lg">
              <!-- Section Header -->
              <div 
                class="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50"
                (click)="toggleSection(section.name)"
              >
                <div class="flex items-center space-x-3">
                  <svg 
                    class="w-5 h-5 text-slate-400 transition-transform"
                    [class.rotate-90]="section.isExpanded"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                  <h3 class="font-semibold text-slate-900">{{ section.name }}</h3>
                  <span class="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                    {{ section.notes.length }} {{ section.notes.length === 1 ? 'note' : 'notes' }}
                  </span>
                </div>
                <button
                  (click)="addNoteToSection(section.name); $event.stopPropagation()"
                  class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  + Add Note
                </button>
              </div>

              <!-- Section Notes -->
              @if (section.isExpanded) {
                <div class="border-t border-slate-200">
                  @if (section.notes.length > 0) {
                    <div class="space-y-3 p-4">
                      @for (note of section.notes; track note.id) {
                        <div class="bg-slate-50 rounded-lg p-4 border border-slate-100">
                          <div class="flex items-start justify-between mb-3">
                            <div class="text-xs text-slate-500">
                              {{ formatDate(note.updatedAt) }}
                            </div>
                            <div class="flex gap-2">
                              <button
                                (click)="editNote(note)"
                                class="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                Edit
                              </button>
                              <button
                                (click)="deleteNote(note.id)"
                                class="text-red-600 hover:text-red-800 text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          <div 
                            class="prose prose-sm max-w-none text-slate-700"
                            [innerHTML]="note.content"
                          ></div>
                        </div>
                      }
                    </div>
                  } @else {
                    <div class="text-center py-6 text-slate-500">
                      <p class="text-sm">No notes in this section yet</p>
                      <button
                        (click)="addNoteToSection(section.name)"
                        class="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
                      >
                        Add the first note
                      </button>
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>
      } @else {
        <!-- Empty State -->
        <div class="text-center py-12">
          <svg class="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" 
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <h3 class="text-lg font-medium text-slate-900 mb-2">No Notes Yet</h3>
          <p class="text-slate-600 mb-6">
            Add your thoughts, analysis, and strategy for this stock
          </p>
          
          <!-- Quick Add Buttons -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
            @for (section of commonSections; track section) {
              <button
                (click)="addNoteToSection(section)"
                class="px-3 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                {{ section }}
              </button>
            }
          </div>
          
          <button
            (click)="showAddNoteModal.set(true)"
            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Add Your First Note
          </button>
        </div>
      }
    </div>

    <!-- Add/Edit Note Modal -->
    @if (showAddNoteModal() || editingNote()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-slate-900">
                {{ editingNote() ? 'Edit Note' : 'Add Note' }}
              </h2>
              <button
                (click)="cancelNote()"
                class="text-slate-400 hover:text-slate-600"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form (ngSubmit)="saveNote()" #form="ngForm">
              <div class="mb-6">
                <label class="block text-sm font-medium text-slate-700 mb-2">
                  Section <span class="text-red-500">*</span>
                </label>
                <div class="flex gap-2 mb-2">
                  @for (section of commonSections; track section) {
                    <button
                      type="button"
                      (click)="noteForm.section = section"
                      [class]="getSectionButtonClass(section)"
                    >
                      {{ section }}
                    </button>
                  }
                </div>
                <input
                  type="text"
                  [(ngModel)]="noteForm.section"
                  name="section"
                  required
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter section name or select from above"
                />
              </div>

              <div class="mb-6">
                <label class="block text-sm font-medium text-slate-700 mb-2">
                  Content <span class="text-red-500">*</span>
                </label>
                <quill-editor
                  [(ngModel)]="noteForm.content"
                  name="content"
                  [modules]="quillModules"
                  [styles]="{ height: '300px' }"
                  placeholder="Write your analysis, thoughts, or strategy..."
                  class="bg-white border border-slate-300 rounded-lg"
                ></quill-editor>
              </div>

              <div class="flex gap-3 pt-4">
                <button
                  type="button"
                  (click)="cancelNote()"
                  class="flex-1 px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  [disabled]="!isFormValid()"
                  class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ editingNote() ? 'Update Note' : 'Save Note' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host ::ng-deep .ql-editor {
      min-height: 250px;
      font-family: inherit;
    }
    
    :host ::ng-deep .ql-toolbar {
      border-top-left-radius: 0.5rem;
      border-top-right-radius: 0.5rem;
      border-bottom: none;
    }
    
    :host ::ng-deep .ql-container {
      border-bottom-left-radius: 0.5rem;
      border-bottom-right-radius: 0.5rem;
      border-top: none;
    }

    :host ::ng-deep .prose h1 { @apply text-lg font-bold text-slate-900 mb-2; }
    :host ::ng-deep .prose h2 { @apply text-base font-bold text-slate-900 mb-2; }
    :host ::ng-deep .prose h3 { @apply text-sm font-bold text-slate-900 mb-1; }
    :host ::ng-deep .prose p { @apply mb-2; }
    :host ::ng-deep .prose ul { @apply list-disc list-inside mb-2; }
    :host ::ng-deep .prose ol { @apply list-decimal list-inside mb-2; }
    :host ::ng-deep .prose blockquote { @apply border-l-4 border-slate-300 pl-4 italic; }
    :host ::ng-deep .prose strong { @apply font-semibold; }
    :host ::ng-deep .prose em { @apply italic; }
  `]
})
export class EnhancedNotesComponent implements OnInit {
  notes = input<Note[]>([]);;
noteAdded = output<{ section: string; content: string }>();
noteUpdated = output<{ id: string; section: string; content: string }>();
noteDeleted = output<string>();

  showAddNoteModal = signal(false);
  editingNote = signal<Note | null>(null);

  noteForm = {
    section: '',
    content: ''
  };

  commonSections = [
    'Why I Bought',
    'Moat Analysis', 
    'Exit Strategy',
    'Risk Assessment',
    'Competitive Advantage',
    'Financial Health',
    'Growth Prospects',
    'Management Quality'
  ];

  // Rich text editor configuration
  quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['clean'],
      ['link']
    ]
  };

  // Group notes by section
  noteSections = computed(() => {
    const sectionMap = new Map<string, Note[]>();
    
    this.notes().forEach(note => {
      if (!sectionMap.has(note.section)) {
        sectionMap.set(note.section, []);
      }
      sectionMap.get(note.section)!.push(note);
    });

    return Array.from(sectionMap.entries()).map(([name, notes]) => ({
      name,
      notes: notes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
      isExpanded: true // Start with sections expanded
    }));
  });

  ngOnInit() {
    // Auto-expand sections if there are notes
    if (this.notes.length > 0) {
      this.expandAllSections();
    }
  }

  toggleSection(sectionName: string) {
    const sections = this.noteSections();
    const section = sections.find(s => s.name === sectionName);
    if (section) {
      section.isExpanded = !section.isExpanded;
    }
  }

  expandAllSections() {
    this.noteSections().forEach(section => {
      section.isExpanded = true;
    });
  }

  addNoteToSection(sectionName: string) {
    this.noteForm.section = sectionName;
    this.noteForm.content = '';
    this.showAddNoteModal.set(true);
  }

  editNote(note: Note) {
    this.editingNote.set(note);
    this.noteForm.section = note.section;
    this.noteForm.content = note.content;
    this.showAddNoteModal.set(true);
  }

  saveNote() {
    if (!this.isFormValid()) return;

    const editing = this.editingNote();
    if (editing) {
      this.noteUpdated.emit({
        id: editing.id,
        section: this.noteForm.section.trim(),
        content: this.noteForm.content.trim()
      });
    } else {
      this.noteAdded.emit({
        section: this.noteForm.section.trim(),
        content: this.noteForm.content.trim()
      });
    }

    this.cancelNote();
  }

  cancelNote() {
    this.showAddNoteModal.set(false);
    this.editingNote.set(null);
    this.noteForm.section = '';
    this.noteForm.content = '';
  }

  deleteNote(noteId: string) {
    if (confirm('Are you sure you want to delete this note?')) {
      this.noteDeleted.emit(noteId);
    }
  }

  isFormValid(): boolean {
    return !!(this.noteForm.section?.trim() && this.noteForm.content?.trim());
  }

  getSectionButtonClass(section: string): string {
    const isSelected = this.noteForm.section === section;
    return `px-3 py-1 text-xs rounded-full transition-colors ${
      isSelected 
        ? 'bg-blue-600 text-white' 
        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
    }`;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
