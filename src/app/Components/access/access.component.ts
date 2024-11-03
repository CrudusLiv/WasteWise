import { Component } from '@angular/core';

@Component({
  selector: 'app-access',
  templateUrl: './access.component.html',
  styleUrl: './access.component.css'
})
export class AccessComponent {
  loginForm: any = {};
  signupForm: any = {};
  email: string = '';
  password: string = '';
  hidePassword: boolean = true;
  selectedTab: string = 'signup';

  onSubmit() {
    console.log(this.loginForm);
  }

  onSignup() {
    console.log(this.signupForm);
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
    }
    return '';

  }
}
