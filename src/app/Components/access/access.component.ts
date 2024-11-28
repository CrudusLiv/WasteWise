import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-access',
  templateUrl: './access.component.html',
  styleUrl: './access.component.css'
})
export class AccessComponent implements OnInit {
  loginForm: FormGroup;
  signupForm: FormGroup;
  hidePassword: boolean = true;
  selectedTab: number = 0;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    }, { validator: this.passwordMatchValidator });
  }
  ngOnInit(): void {}

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.snackBar.open('Login successful!', 'Close', { duration: 3000 });
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.snackBar.open(error || 'Login failed', 'Close', { duration: 3000 });
        }
      });
    }
  }

  onSignup() {
    if (this.signupForm.valid) {
      this.authService.signup(this.signupForm.value).subscribe({
        next: (response) => {
          const loginData = {
            email: this.signupForm.value.email,
            password: this.signupForm.value.password
          };
          
          this.authService.login(loginData).subscribe({
            next: (loginResponse) => {
              this.authService.emitSignupEvent();
              this.router.navigate(['/profile-setup'], { 
                state: { isNewUser: true }
              });
            },
            error: (error) => {
              this.snackBar.open('Login failed after signup', 'Close', { 
                duration: 3000 
              });
            }
          });
        },
        error: (error) => {
          this.snackBar.open(error || 'Registration failed', 'Close', { 
            duration: 3000 
          });
        }
      });
    }
  }
  getErrorMessage(controlName: string, formType: 'login' | 'signup'): string {
    const form = formType === 'login' ? this.loginForm : this.signupForm;
    const control = form.get(controlName);
    
    if (control?.hasError('required')) {
      return 'This field is required';
    } else if (control?.hasError('email')) {
      return 'Please enter a valid email';
    } else if (control?.hasError('minlength')) {
      return 'Password must be at least 6 characters long';
    } else if (control?.hasError('mismatch')) {
      return 'Passwords do not match';
    }
    return '';
  }
}
