import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NgToastService } from 'ng-angular-popup';

import { MovieService } from 'src/app/services/movie.service';

@Component({
  selector: 'app-add-movie',
  templateUrl: './add-movie.component.html',
  styleUrls: ['./add-movie.component.scss'],
})
export class AddMovieComponent implements OnInit {
  movieForm!: FormGroup;
  posterBase64: string | null = null;

  constructor(
    private fb: FormBuilder,
    private movieService: MovieService,
    private toast: NgToastService
  ) {}

  ngOnInit(): void {
    this.movieForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      duration: ['', Validators.required],
      poster: [null],
    });
  }

  onSubmit() {
    if (this.movieForm.valid) {
      const formValue = this.movieForm.value;
      delete formValue.poster;
      const base64 = this.movieForm.get('poster')?.value;
      formValue.poster = base64;

      this.movieService.addMovie(formValue).subscribe({
        next: (res) => {
          this.movieForm.reset();
          this.toast.success({
            detail: 'SUCCESS',
            summary: res.message,
            duration: 5000,
          });
        },
        error: (err) => {
          this.toast.error({
            detail: 'ERROR',
            summary: err.error.message,
            duration: 5000,
          });
        },
      });
    } else {
      this.validateAllFormFields(this.movieForm);
      this.toast.error({
        detail: 'ERROR',
        summary: 'Form is not valid',
        duration: 5000,
      });
    }
  }

  async onImagePicked(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];

      try {
        const base64String = await this.fileToBase64(file);
        console.log('Base64 string length:', base64String.length);
        this.movieForm.patchValue({ poster: base64String });
      } catch (error) {
        console.error('Error converting file to Base64:', error);
      }
    }
  }

  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        resolve(base64String.split(',')[1]);
      };
      reader.onerror = (error) => reject(error);
    });
  }

  reset() {
    this.movieForm.reset();
  }

  private validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);

      if (control instanceof FormControl) {
        control.markAsDirty({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }
}
