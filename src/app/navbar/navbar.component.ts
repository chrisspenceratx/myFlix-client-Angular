import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// Import MatSnackBar to display notifications
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  // Inject the MatSnackBar service dependency
  constructor(
    public snackBar: MatSnackBar,
    public router: Router
  ) { }

  ngOnInit(): void {
  }

  /**
   * Function to navigate to movies page
   */
  public openMovies(): void {
    this.router.navigate(['movies']);
  }

  /**
   * Function to navigate to profile page
   */
  public openProfile(): void {
    this.router.navigate(['profile']);
  }
  /**
   * This method will log the user out
   */

  public logoutUser(): void {
    // Clear the token and user data from the browser's local storage
    localStorage.setItem('token', '');
    localStorage.setItem('user', '');
    this.snackBar.open('You have been logged out', 'OK', {
      duration: 2000,
    });
    // Redirect the user to the welcome page
    this.router.navigate(['welcome']);
  }

}