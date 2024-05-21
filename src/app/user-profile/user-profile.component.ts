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


/**
 * UserProfileComponent is a component that handles user profile related operations.
 * It allows users to view and update their profile, view their favorite movies, add or remove movies from their favorites, and delete their account.
 * It also provides dialogues for viewing genre, director, and movie synopsis information.
 */
@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  /**
   * Input decorator is used to create custom properties for the UserProfileComponent which can be binded in the parent component.
   */
  @Input() userData = { Username: '', Email: '', Birthday: '', FavoriteMovies: [], UserId: '' };
  formUserData = { Username: '', Email: '', Birthday: '', FavoriteMovies: [], UserId: '' };

  /**
   * User and movies are used to store the user's profile and movies data respectively.
   * FavoriteMovies and favoriteMoviesIDs are used to store the user's favorite movies and their IDs respectively.
   */
  user: any = {};
  movies: any[] = [];
  FavoriteMovies: any[] = [];
  favoriteMoviesIDs: any[] = [];

  /**
   * Constructor for the UserProfileComponent.
   * It injects the FetchApiDataService, MatDialog, MatSnackBar, and Router services.
   */
  constructor(
    private fetchApiData: FetchApiDataService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    public router: Router
  ) { }

  /**
   * ngOnInit is a lifecycle hook that is called after Angular has initialized all data-bound properties of a directive.
   */
  ngOnInit(): void {
    // this.getFavMovies();
    this.getProfile();
  }


  /**
   * getProfile method fetches the user's profile information and favorite movies.
   */
  getProfile(): void {
    this.fetchApiData.getUser().subscribe((response) => {
      console.log('response:', response)
      this.user = response;
      this.userData.Username = this.user.Username;
      this.userData.Email = this.user.Email;
      let birthday = new Date(this.user.BirthDay)
      this.userData.Birthday = birthday.toISOString().split('T')[0];
      this.userData.UserId = this.user._id;
      this.formUserData = { ...this.userData }
      this.favoriteMoviesIDs = this.user.FavoriteMovies;
    });
    this.fetchApiData.getAllMovies().subscribe((response) => {
      this.FavoriteMovies = response.filter((movie: any) => this.favoriteMoviesIDs.includes(movie._id));
    });
  }


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

  /**
   * isFav method checks if a movie is in the user's favorite movies list.
   */
  isFav(movie: any): boolean {
    return this.favoriteMoviesIDs.includes(movie._id);
  }

  /**
   * toggleFav method adds or removes a movie from the user's favorite movies list.
   */
  toggleFav(movie: any): void {
    const isFavorite = this.isFav(movie);
    isFavorite
      ? this.deleteFavMovies(movie)
      : this.addFavMovies(movie);
  }

  /**
   * addFavMovies method adds a movie to the user's favorite movies list.
   */
  addFavMovies(movie: any): void {
    let user = localStorage.getItem('user');
    if (user) {
      let parsedUser = JSON.parse(user);
      this.userData.UserId = parsedUser._id;
      this.fetchApiData.addFavoriteMovie(parsedUser._id, movie._id).subscribe((resp) => {
        localStorage.setItem('user', JSON.stringify(resp));
        this.getFavMovies();
        this.snackBar.open(`${movie.Title} has been added to your favorites`, 'OK', {
          duration: 3000,
        });
      });
    }
  }

  /**
   * deleteFavMovies method removes a movie from the user's favorite movies list.
   */
  deleteFavMovies(movie: any): void {
    let user = localStorage.getItem('user');
    if (user) {
      let parsedUser = JSON.parse(user);
      this.fetchApiData.deleteFavoriteMovie(parsedUser._id, movie._id).subscribe((resp) => {
        localStorage.setItem('user', JSON.stringify(resp));
        // this.getFavMovies();
        this.FavoriteMovies = this.FavoriteMovies.filter(favorite_movie => favorite_movie._id !== movie._id);
        this.snackBar.open(`${movie.Title} has been removed from your favorites`, 'OK', {
          duration: 3000,
        });
      });
    }
  }

  /**
   * updateUser method updates the user's profile information.
   */
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

  /**
   * deleteUser method deletes the user's account.
   */
  async deleteUser(): Promise<void> {
    console.log('deleteUser function called:', this.userData.UserId)
    if (confirm('Do you want to delete your account permanently?')) {
      // await this.getProfile();
      this.fetchApiData.deleteUser(this.userData.UserId).subscribe(() => {
        this.snackBar.open('Account deleted successfully!', 'OK', {
          duration: 3000,
        });
      });
      localStorage.clear();
      this.router.navigate(['welcome']);
    }
  }

  /**
 * openGenreDialog, openDirectorDialog, and openSynopsisDialog methods open dialogues for viewing genre, director, and movie synopsis information respectively.
 */
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

}