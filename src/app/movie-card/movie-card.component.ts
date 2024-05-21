import { FetchApiDataService } from './../fetch-api-data.service';
import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { of } from 'rxjs';

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
  @Input() movies: any = [];
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
  // getFavMovies(): void { 
  //   this.fetchApiData.getUser().subscribe((resp: any) => {
  //     console.log('Server response in getFavMovies', resp)
  //     if (resp) {
  //       this.user = resp;
  //       if (Array.isArray(this.user.FavoriteMovies)) {
  //         this.FavoriteMovies = this.user.FavoriteMovies;
  //       }
  //       console.log('Fav Movies in getFavMovie', this.FavoriteMovies);
  //     };
  //     return this.user;
  //   });  
  // }


  isFav(movie: any): boolean {
    return this.FavoriteMovies.includes(movie._id);
  }
  // isFav(movie: any): any {
  //   const MovieID = movie._id;
  //   if (this.FavoriteMovies.some((movie) => movie === MovieID)) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }

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
}