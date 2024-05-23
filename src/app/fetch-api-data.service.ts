import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of, tap } from 'rxjs';
import { map } from 'rxjs/operators';

//Declaring the api url that will provide data for the client app
const apiUrl = 'https://spencer-flix-c2b5a70a1e0d.herokuapp.com/';

@Injectable({
  providedIn: 'root'
})


export class FetchApiDataService {
  // Inject the HttpClient module to the constructor params
  // This will provide HttpClient to the entire class, making it available via this.http
  constructor(private http: HttpClient) { }


  // This service will handle the user registration form

  // Making the api call for the user registration endpoint
  public userRegistration(userDetails: any): Observable<any> {
    console.log(userDetails);
    return this.http.post(apiUrl + 'users', userDetails).pipe
      (
        catchError(this.handleError)
      );
  }


  // This service will handle the user login form
  public userLogin(userDetails: any): Observable<any> {
    console.log(userDetails);
    return this.http.post(apiUrl + 'login', userDetails).pipe
      (
        catchError(this.handleError)
      );
  }

  // get all movies
  public getAllMovies(): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get(apiUrl + 'movies', {
      headers: new HttpHeaders(
        {
          Authorization: 'Bearer ' + token,
        })
    }).pipe(
      map(this.extractResponseData),
      catchError(this.handleError)
    );
  }


  // Get a single movie by title
  public getOneMovie(title: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get(apiUrl + 'movies/' + title, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token,
      })
    }).pipe(
      map(this.extractResponseData),
      catchError(this.handleError)
    );
  }

  // Get a director by name
  public getDirector(directorName: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get(apiUrl + 'movies/directors/' + directorName, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token,
      })
    }).pipe(
      map(this.extractResponseData),
      catchError(this.handleError)
    );
  }

  // get a genre by name
  public getGenre(genreName: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get(apiUrl + 'movies/genres/' + genreName, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token,
      })
    }).pipe(
      map(this.extractResponseData),
      catchError(this.handleError)
    );
  }

  /**
   * Making the api call for the Get User endpoint.
   * @returns {Observable<any>} - Observable for the API response.
   */
  public getLocalUser(): any {
    const user = localStorage.getItem('user');
    if (user && this.isJsonString(user)) {
      return JSON.parse(user);
    } else {
      console.log('Invalid user data in local storage:', user);
      return null;
    }
  }

  private isJsonString(str: string): boolean {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  public setLocalUser(user: any): void {
    if (user.isJsonObject(user))
      localStorage.setItem('user', JSON.stringify(user));
    else
      console.log('Error setting user');
  }

  public getUser(userId?: string): Observable<any> {

    const user = this.getLocalUser();

    const token = localStorage.getItem('token');
    return this.http.get(apiUrl + 'users/' + user.Username, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token,
      })
    }).pipe(
      tap({
        next: data => {
          if (this.isJsonString(JSON.stringify(data))) {
          } else {
            console.log('Data is not valid JSON:', data);
          }
        },
        error: error => console.log('Error:', error)
      }),
      map(this.extractResponseData),
      catchError(this.handleError)
    );
  }

  // Get favourite movies by userid
  public getFavoriteMovies(userId: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get(apiUrl + 'users/' + userId + '/FavoriteMovies', {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token,
      })
    }).pipe(
      map(this.extractResponseData),
      catchError(this.handleError)
    );
  }

  // Add a movie to a user's list of favorites
  public addFavoriteMovie(userId: string, movieId: string): Observable<any> {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    console.log('addFavoriteMovie: ', user);
    if (user !== null) {
      let parsedUser = JSON.parse(user);
      console.log('apiUrl: ', apiUrl + 'users/' + parsedUser.Username + '/movies/' + movieId);
      return this.http.post(apiUrl + 'users/' + parsedUser.Username + '/movies/' + movieId, movieId, {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        })
      }).pipe(
        map(this.extractResponseData),
        catchError(this.handleError)
      );
    } else {
      console.log('User data not found');
      return of(null);
    }

  }

  // Delete a movie from a user's list of favorites
  public deleteFavoriteMovie(userId: string, movieId: string): Observable<any> {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (user !== null) {
      let parsedUser = JSON.parse(user);
      return this.http.delete(apiUrl + 'users/' + parsedUser.Username + '/movies/' + movieId, {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        })
      }).pipe(
        map(this.extractResponseData),
        catchError(this.handleError)
      );
    } else {
      console.log('User data not found');
      return of(null);
    }
  }

  // Edit a user's profile
  public editUserProfile(userDetails: any): Observable<any> {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    return this.http.put(apiUrl + 'users/' + user.UserId, userDetails, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token,
      })
    }).pipe(
      map(this.extractResponseData),
      catchError(this.handleError)
    );
  }

  // Delete a user 
  public deleteUser(userId: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.delete(apiUrl + 'users/' + userId, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token,
      })
    }).pipe(
      map(this.extractResponseData),
      catchError(this.handleError)
    );
  }


  /**
    * @description Extract non-typed response data from the API response.
    * @param {any} res - API response.
    * @returns {any} - Extracted response data.
    * @private
    */
  private extractResponseData(res: Response | Object): any {
    const body = res;
    return body || {};
  }

  /**
    * @description Handle HTTP errors and log them.
    * @param {HttpErrorResponse} error - HTTP error response.
    * @returns {any} - Error details.
    * @private
    */
  private handleError(error: HttpErrorResponse): any {
    if (error.error instanceof ErrorEvent) {
      console.error('Some error occurred:', error.error.message);
    } else {
      console.error(
        `Error Status code ${error.status}, ` +
        `Error body is: ${error.error}`);
    }
    return throwError(() => new Error('Something bad happened; please try again later.'))
  }

}    