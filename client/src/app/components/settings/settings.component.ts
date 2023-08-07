import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NgToastService } from 'ng-angular-popup';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  userForm!: FormGroup;
  userId: number = -1;
  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private toast: NgToastService
  ) {}

  ngOnInit(): void {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      password: ['', Validators.required],
    });

    this.loadUserData();
  }

  loadUserData() {
    const id = this.auth.getUserIdFromToken();
    this.userId = id;
    console.log(this.userId);

    this.auth.getUserById(id).subscribe(
      (data) => {
        console.log(data);

        this.userForm.patchValue({
          firstName: data.firstName,
          lastName: data.lastName,
          password: data.password,
        });

        console.log(this.userForm.value);
      },
      (error) => {
        console.log('Failed to load user data', error);
      }
    );
  }

  onSubmit() {
    if (this.userForm.valid) {
      console.log(this.userForm.value);
      this.auth.updateUser(this.userId, this.userForm.value).subscribe({
        next: (res: any) => {
          this.toast.success({
            detail: 'SUCCESS',
            summary: res.message,
            duration: 5000,
          });
        },
        error: (err: any) => {
          this.toast.error({
            detail: 'ERROR',
            summary: err.error.message,
            duration: 5000,
          });
        },
      });
    } else {
      this.validateAllFormFields(this.userForm);
      this.toast.error({
        detail: 'ERROR',
        summary: 'Form is not valid',
        duration: 5000,
      });
    }
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
