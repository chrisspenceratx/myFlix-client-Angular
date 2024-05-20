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

  @Input() userData = { Username: '', Email: '', Birthday: '', FavoriteMovies: [], UserId: '' };

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
    this.getFavMovies();
  }

  /**
   * This method will get the user's profile information:
   * @returns users username, email, birthday and favorite movies
   */

  getProfile(): void {
    this.user = this.fetchApiData.getUser();
    this.userData.Username = this.user.Username;
    this.userData.Email = this.user.Email;
    this.userData.Birthday = this.user.Birthday;
    this.fetchApiData.getAllMovies().subscribe((response) => {
      this.FavoriteMovies = response.filter((movie: any) => this.user.FavoriteMovies.includes(movie._id));
    });
  }
  // getProfile(): void {
  //   const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string) : null;
  //   console.log('user in getProfile:', user)
  //   const userId = user ? user._id : null;
  //   console.log('userId in getProfile:', userId)
  //   if (userId) {
  //     console.log('userId in getProfile:', userId)
  //     this.fetchApiData.getUser(userId).subscribe((user: any) => {
  //       console.log('User data from server:', user);
  //       this.user = user;
  //       this.userData.Username = this.user.Username;
  //       this.userData.Email = this.user.Email;
  //       this.userData.Birthday = this.user.Birthday;
  //       console.log('User data after assignment:', this.userData);
  //       this.fetchApiData.getAllMovies().subscribe((resp: any) => {
  //         console.log('All movies from server:', resp);
  //         this.FavoriteMovies = resp.filter((movie: any) => this.user.FavoriteMovies.includes(movie._id));
  //         console.log('Favorite movies after assignment to FavoriteMovies variable:', this.FavoriteMovies);
  //       });
  //     });
  //   }
  // }

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
      console.log(this.movies);
      return this.movies;
    });
  }


  /**
   * Function to get user's favorite movies
   * @returns user's favorite movies
   */
  getFavMovies(): void {
    let user = localStorage.getItem('user');
    if (user) {
      let parsedUser = JSON.parse(user);
      this.userData.UserId = parsedUser._id;
      this.userData.FavoriteMovies = parsedUser.FavoriteMovies;
      this.FavoriteMovies = parsedUser.FavoriteMovies;
    }
    console.log('Favorite Movies:', this.FavoriteMovies);
  }

  isFav(movie: any): any {
    const MovieID = movie._id;
    if (this.FavoriteMovies.some((movie) => movie === MovieID)) {
      return true;
    } else {
      return false;
    }
  }

  toggleFav(movie: any): void {
    console.log('toggleFav called with movie:', movie);
    const isFavorite = this.isFav(movie);
    console.log('isFavorite:', isFavorite);
    isFavorite
      ? this.deleteFavMovies(movie)
      : this.addFavMovies(movie);
  }

  addFavMovies(movie: any): void {
    console.log('addFavMovies called with movie:', movie)
    let user = localStorage.getItem('user');
    if (user) {
      let parsedUser = JSON.parse(user);
      console.log('user:', parsedUser);
      this.userData.UserId = parsedUser._id;
      console.log('userData:', this.userData);
      this.fetchApiData.addFavoriteMovie(parsedUser._id, movie._id).subscribe((Resp) => {
        console.log('server response:', Resp);
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