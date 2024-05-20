import { FetchApiDataService } from './../fetch-api-data.service';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

// import components
import { DirectorInfoComponent } from '../director-info/director-info.component';
import { MovieSynopsisComponent } from '../movie-synopsis/movie-synopsis.component';
import { GenreInfoComponent } from '../genre-info/genre-info.component';


@Component({
  selector: 'app-movie-card',
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.scss']
})
export class MovieCardComponent implements OnInit {
  movies: any[] = [];
  user: any = {};
  userData = { Username: "", FavoriteMovies: [] };
  FavoriteMovies: any[] = [];
  isFavMovie: boolean = false;

  constructor(
    public fetchApiData: FetchApiDataService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.getMovies();
    this.getFavMovies();
  }

  getMovies(): void {
    this.fetchApiData.getAllMovies().subscribe((resp: any) => {
      this.movies = resp;
      console.log(this.movies);
      return this.movies;
    });
  }

  /**
   * this method will open a dialog with genre information when genre button is clicked
   * @param {string} name - Name of Genre
   * @param {string} description - Description of genre
   * @returns movies genre description
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
   * this method will open a dialog with directors information when director button is clicked
   * @param {string} name - Name of director
   * @param {string} bio - Bio of director
   * @param {string} birth - Birthdate of director
   * @param {string} death - Deathdate of director
   * @returns Directors name, bio, birthdate and deathdate
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
  /*
   * This method will open a dialog with the Movies Synopsis when the synopsis button is clicked:
   * @returns movies description
   */
  openSynopsisDialog(description: string): void {
    this.dialog.open(MovieSynopsisComponent, {
      data: {
        Description: description
      },
      width: '500px',
    });
  }

  /**
   * This method will get favMovie list.
   * @returns list of favorite movies
   */
  getFavMovies(): void {
    this.user = this.fetchApiData.getUser();
    this.userData.FavoriteMovies = this.user.FavoriteMovies;
    this.FavoriteMovies = this.user.FavoriteMovies;
    console.log('Fav Movies in getFavMovie', this.FavoriteMovies);
  }

  /**
   * this method will check if movie is a favorite move
   * @param movie - Movie object to check
   * @returns boolean - whether movie is a favorite or not
   */
  isFav(movie: any): any {
    const MovieID = movie._id;
    if (this.FavoriteMovies.includes((movie) => movie === MovieID)) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * this method adds or deletes movie from favorite list when favorite button/icon is clicked
   */
  toggleFav(movie: any): void {
    const isFavorite = this.isFav(movie);
    isFavorite
      ? this.deleteFavMovies(movie)
      : this.addFavMovies(movie);
  }

  /**
   * this method adds movie to favorite list
   * @param {any} movie - Movie object to add to favorite list
   * @returns Message "Movie has been added to your favorites"
   */
  addFavMovies(movie: any): void {
    this.user = this.fetchApiData.getUser();
    this.userData.Username = this.user.Username;
    this.fetchApiData.addFavoriteMovie(this.user._id, movie._id).subscribe((Resp) => {
      localStorage.setItem('user', JSON.stringify(Resp));
      this.getFavMovies();
      this.snackBar.open(`${movie.Title} has been added to your favorites`, 'OK', {
        duration: 3000,
      });
    });
  }

  /**
   * this method deletes movie from favorite list
   * @param {any} movie - Movie object to delete from favorite list
   * @returns Message "Movie has been removed from your favorites"
   */
  deleteFavMovies(movie: any): void {
    this.user = this.fetchApiData.getUser();
    this.userData.Username = this.user.Username;
    this.fetchApiData.deleteFavoriteMovie(this.user._id, movie._id).subscribe((Resp) => {
      localStorage.setItem('user', JSON.stringify(Resp));
      this.getFavMovies();
      this.snackBar.open(`${movie.Title} has been removed from your favorites`, 'OK', {
        duration: 3000,
      });
    });
  }


}