import { FetchApiDataService } from './../fetch-api-data.service';
import { Component, OnInit, Input } from '@angular/core';
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
  @Input() movies: any = {};
  user: any = {};
  userData = { UserId: "", FavoriteMovies: [] }
  FavoriteMovies: any[] = [];


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



  getFavMovies(): void {
    this.user = this.fetchApiData.getUser();
    this.FavoriteMovies = this.user.FavoriteMovies;
    console.log('Fav Movies in getFavMovie', this.FavoriteMovies);
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
    const isFavorite = this.isFav(movie);
    isFavorite
      ? this.deleteFavMovies(movie)
      : this.addFavMovies(movie);
  }

  addFavMovies(movie: any): void {
    this.user = this.fetchApiData.getUser();
    this.userData.UserId = this.user._id;
    this.fetchApiData.addFavoriteMovie(this.user._id, movie._id).subscribe((Resp) => {
      localStorage.setItem('user', JSON.stringify(Resp));
      this.getFavMovies();
      this.snackBar.open(`${movie.Title} has been added to your favorites`, 'OK', {
        duration: 3000,
      });
    });
  }

  deleteFavMovies(movie: any): void {
    this.user = this.fetchApiData.getUser();
    this.fetchApiData.deleteFavoriteMovie(this.user._id, movie._id).subscribe((Resp) => {
      localStorage.setItem('user', JSON.stringify(Resp));
      this.getFavMovies();
      this.snackBar.open(`${movie.Title} has been removed from your favorites`, 'OK', {
        duration: 3000,
      });
    });
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
}