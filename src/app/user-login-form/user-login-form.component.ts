import { FetchApiDataService } from '../fetch-api-data.service';
import { Component, OnInit, Input } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

/**
 * Component for user login form.
 */
@Component({
  selector: 'app-user-login-form',
  templateUrl: './user-login-form.component.html',
  styleUrls: ['./user-login-form.component.scss']
})
export class UserLoginFormComponent implements OnInit {

  /**
   * User data input.
   */
  @Input() userData = { Username: '', Password: '' };

  /**
   * Constructs the UserLoginFormComponent.
   * @param FetchApiDataService - The service for fetching API data.
   * @param dialogRef - The reference to the dialog.
   * @param snackBar - The service for showing snack bar notifications.
   * @param router - The Angular router.
   */
  constructor(
    public FetchApiDataService: FetchApiDataService,
    public dialogRef: MatDialogRef<UserLoginFormComponent>,
    public snackBar: MatSnackBar,
    private router: Router
  ) { }

  /**
   * Angular's OnInit lifecycle hook.
   */
  ngOnInit(): void {
  }

  /**
   * Logs in a user.
   * Sends the user data to the backend and handles the response.
   */
  loginUser(): void {
    this.snackBar.open('Note: As this is a personal project and I deployed my API on render, my free instance will spin down with inactivity, which can delay requests by 50 seconds or more. Thank you for your patience.', "OK", {
      duration: 2000
    });
    this.FetchApiDataService.userLogin(this.userData).subscribe({
      next: (result) => {
        // Logic for a successful user login
        console.log('User object:', result.user);
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('token', result.token);
        this.dialogRef.close(); // This will close the modal on success!
        console.log(result);
        this.snackBar.open('user logged in successfully', 'OK', {
          duration: 2000
        });
        this.router.navigate(['movies']);
      },
      error: (result) => {
        this.snackBar.open('login failed', 'OK', {
          duration: 2000
        });
      }
    });
  }
}