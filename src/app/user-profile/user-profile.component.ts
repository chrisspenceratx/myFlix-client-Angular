import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
// Import MatSnackBar to display notifications
import { MatSnackBar } from '@angular/material/snack-bar';

// Component Imports
import { DirectorInfoComponent } from '../director-info/director-info.component';
import { GenreInfoComponent } from '../genre-info/genre-info.component';
import { MovieSynopsisComponent } from '../movie-synopsis/movie-synopsis.component';

// Import the API calls service
import { FetchApiDataService } from '../fetch-api-data.service';



@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  @Input() userData = { Username: '', Email: '', Birthday: '', FavoriteMovies: [], UserId: '' };
  formUserData = { Username: '', Email: '', Birthday: '', FavoriteMovies: [], UserId: '' };

  user: any = {};
  movies: any[] = [];
  FavoriteMovies: any[] = [];
  favoriteMoviesIDs: any[] = [];

  constructor(
    private fetchApiData: FetchApiDataService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    public router: Router
  ) { }

  ngOnInit(): void {
    // this.getFavMovies();
    this.getProfile();
  }

  /**
   * This method will get the user's profile information:
   * @returns users username, email, birthday and favorite movies
   */

  getProfile(): Promise<void> {
    return new Promise((resolve) => {
      this.fetchApiData.getUser().subscribe((response) => {
        console.log('response:', response)
        this.user = response;
        this.userData.Username = this.user.Username;
        this.userData.Email = this.user.Email;
        this.userData.Birthday = this.user.Birthday;
        this.userData.UserId = this.user._id; // Add this line
        this.formUserData = { ...this.userData }
        this.favoriteMoviesIDs = this.user.FavoriteMovies;
        this.fetchApiData.getAllMovies().subscribe((response) => {
          this.FavoriteMovies = response.filter((movie: any) => this.favoriteMoviesIDs.includes(movie._id));
          resolve();
        });
      });
    });
  }

  /**
   * this method updates the user's profile information
   * @returns message "User update successful" or "User update failed"
   */

  /**
   * Function to get all movies from the database
   * @returns all movies
   */
  getMovies(): void {
    this.fetchApiData.getAllMovies().subscribe((resp: any) => {
      if (Array.isArray(resp)) {
        this.movies = resp;
      }
      return this.movies;
    });
  }


  /**
   * Function to get user's favorite movies
   * @returns user's favorite movies
   */
  getFavMovies(): void {
    this.fetchApiData.getUser().subscribe((response) => {
      this.favoriteMoviesIDs = response.FavoriteMovies;
    });
  }

  isFav(movie: any): boolean {
    return this.favoriteMoviesIDs.includes(movie._id);
  }

  toggleFav(movie: any): void {
    const isFavorite = this.isFav(movie);
    isFavorite
      ? this.deleteFavMovies(movie)
      : this.addFavMovies(movie);
  }

  addFavMovies(movie: any): void {
    let user = localStorage.getItem('user');
    if (user) {
      let parsedUser = JSON.parse(user);
      this.userData.UserId = parsedUser._id;
      this.fetchApiData.addFavoriteMovie(parsedUser._id, movie._id).subscribe((Resp) => {
        localStorage.setItem('user', JSON.stringify(Resp));
        this.getFavMovies();
        this.snackBar.open(`${movie.Title} has been added to your favorites`, 'OK', {
          duration: 3000,
        });
      });
    }
  }

  deleteFavMovies(movie: any): void {
    let user = localStorage.getItem('user');
    if (user) {
      let parsedUser = JSON.parse(user);
      this.fetchApiData.deleteFavoriteMovie(parsedUser._id, movie._id).subscribe((Resp) => {
        localStorage.setItem('user', JSON.stringify(Resp));
        this.getFavMovies();
        this.snackBar.open(`${movie.Title} has been removed from your favorites`, 'OK', {
          duration: 3000,
        });
      });
    }
  }
  openGenreDialog(name: string, description: string): void {
    this.dialog.open(GenreInfoComponent, {
      data: {
        Name: name,
        Description: description
      },
      width: '500px',
    });
  }

  openDirectorDialog(name: string, bio: string, birth: string, death: string): void {
    this.dialog.open(DirectorInfoComponent, {
      data: {
        Name: name,
        Bio: bio,
        Birth: birth,
        Death: death
      },
      width: '500px',
    });
  }

  openSynopsisDialog(title: string, description: string): void {
    this.dialog.open(MovieSynopsisComponent, {
      data: {
        Description: description
      },
      width: '500px',
    });
  }

  updateUser(): void {
    this.fetchApiData.editUserProfile(this.formUserData).subscribe((resp) => {
      console.log('User update success:', resp);
      localStorage.setItem('user', JSON.stringify(resp));
      this.snackBar.open('User updated successfully!', 'OK', {
        duration: 2000,
      });
      this.getProfile();
    }, (error) => {
      console.log('Error updating user:', error);
      this.snackBar.open('Failed to update user', 'OK', {
        duration: 2000,
      });
    });
  }

  // delete user function
  async deleteUser(): Promise<void> {
    console.log('deleteUser function called:', this.userData.UserId)
    if (confirm('Do you want to delete your account permanently?')) {
      await this.getProfile();
      this.fetchApiData.deleteUser(this.userData.UserId).subscribe(() => {
        localStorage.clear();
        this.router.navigate(['welcome']);
        this.snackBar.open('Account deleted successfully!', 'OK', {
          duration: 2000,
        });
      });
    }
  }


}