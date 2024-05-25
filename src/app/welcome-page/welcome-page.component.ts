import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserRegistrationFormComponent } from '../user-registration-form/user-registration-form.component';
import { UserLoginFormComponent } from '../user-login-form/user-login-form.component';

/**
 * WelcomePageComponent is the main component for the welcome page.
 * It provides functionality to open dialogs for user registration and login.
 */
@Component({
  selector: 'app-welcome-page',
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.scss']
})
export class WelcomePageComponent implements OnInit {
  /**
   * Constructor for WelcomePageComponent.
   * @param {MatDialog} dialog - The dialog service for opening dialogs.
   */
  constructor(public dialog: MatDialog) { }

  /**
   * Initializes the component.
   */
  ngOnInit(): void {
  }

  /**
   * Opens the user registration dialog.
   */
  openUserRegistrationDialog(): void {
    this.dialog.open(UserRegistrationFormComponent, {
      width: '380px'
    });
  }

  /**
   * Opens the user login dialog.
   */
  openUserLoginDialog(): void {
    this.dialog.open(UserLoginFormComponent, {
      width: '380px'
    });
  }
}
