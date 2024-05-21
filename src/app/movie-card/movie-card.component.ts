// Import necessary modules and services
import { FetchApiDataService } from './../fetch-api-data.service';
import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { of } from 'rxjs';

// Import components
import { DirectorInfoComponent } from '../director-info/director-info.component';
import { MovieSynopsisComponent } from '../movie-synopsis/movie-synopsis.component';
import { GenreInfoComponent } from '../genre-info/genre-info.component';

// Component decorator
@Component({
  selector: 'app-movie-card',
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.scss']
})

// MovieCardComponent class
export class MovieCardComponent implements OnInit {
  // Input decorator to bind movies property
  @Input() movies: any = [];
  user: any = {};
  userData = { UserId: "", FavoriteMovies: [] }
  FavoriteMovies: any[] = [];

  // Constructor with necessary services injected
  constructor(
    public fetchApiData: FetchApiDataService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    public router: Router
  ) { }

  // ngOnInit lifecycle hook
  ngOnInit(): void {
    this.getMovies();
    this.getFavMovies();
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

  /**
   * Function to check if a movie is in the user's favorite list
   * @param movie - The movie to check
   * @returns boolean - true if the movie is in the favorite list, false otherwise
   */
  isFav(movie: any): boolean {
    return this.FavoriteMovies.includes(movie._id);
  }

  /**
   * Function to toggle a movie in the user's favorite list
   * @param movie - The movie to toggle
   */
  toggleFav(movie: any): void {
    console.log('toggleFav called with movie:', movie);
    const isFavorite = this.isFav(movie);
    console.log('isFavorite:', isFavorite);
    isFavorite
      ? this.deleteFavMovies(movie)
      : this.addFavMovies(movie);
  }

  /**
   * Function to add a movie to the user's favorite list
   * @param movie - The movie to add
   */
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

  /**
   * Function to remove a movie from the user's favorite list
   * @param movie - The movie to remove
   */
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

  /**
   * Function to open the genre dialog
   * @param name - The name of the genre
   * @param description - The description of the genre
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

  /**
   * Function to open the director dialog
   * @param name - The name of the director
   * @param bio - The biography of the director
   * @param birth - The birth date of the director
   * @param death - The death date of the director
   */
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

  /**
   * Function to open the synopsis dialog
   * @param title - The title of the movie
   * @param description - The description of the movie
   */
  openSynopsisDialog(title: string, description: string): void {
    this.dialog.open(MovieSynopsisComponent, {
      data: {
        Title: title,
        Description: description
      },
      width: '500px',
    });
  }
}