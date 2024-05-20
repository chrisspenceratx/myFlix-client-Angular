import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

// Component Imports
import { DirectorInfoComponent } from '../director-info/director-info.component';
import { GenreInfoComponent } from '../genre-info/genre-info.component';
import { MovieSynopsisComponent } from '../movie-synopsis/movie-synopsis.component';

// Import the API calls service
import { FetchApiDataService } from '../fetch-api-data.service';

// Import MatSnackBar to display notifications
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  @Input() userData = { Username: '', Email: '', Birthday: '', FavoriteMovies: [] };

  user: any = {};
  movies: any[] = [];
  FavoriteMovies: any[] = [];

  constructor(
    public fetchApiData: FetchApiDataService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.getProfile();
  }

  /**
   * This method will get the user's profile information:
   * @returns users username, email, birthday and favorite movies
   */

  getProfile(): void {
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string) : null;
    console.log('user in getProfile:', user)
    const userId = user ? user._id : null;
    console.log('userId in getProfile:', userId)
    if (userId) {
      this.fetchApiData.getUser(userId).subscribe((user: any) => {
        console.log('User data from server:', user);
        this.user = user;
        this.userData.Username = this.user.Username;
        this.userData.Email = this.user.Email;
        this.userData.Birthday = this.user.Birthday;
        console.log('User data after assignment:', this.userData);
        this.fetchApiData.getAllMovies().subscribe((resp: any) => {
          console.log('All movies from server:', resp);
          this.FavoriteMovies = resp.filter((movie: any) => this.user.FavoriteMovies.includes(movie._id));
          console.log('Favorite movies after assignment to FavoriteMovies variable:', this.FavoriteMovies);
        });
      });
    }
  }

  /**
   * this method updates the user's profile information
   * @returns message "User update successful" or "User update failed"
   */

  updateUser(): void {
    this.fetchApiData.editUserProfile(this.userData).subscribe((resp) => {
      console.log('User update success:', resp);
      localStorage.setItem('user', JSON.stringify(resp));
      this.snackBar.open('User updated successfully!', 'OK', {
        duration: 2000,
      });
    }, (error) => {
      console.log('Error updating user:', error);
      this.snackBar.open('Failed to update user', 'OK', {
        duration: 2000,
      });
    });
  }
}