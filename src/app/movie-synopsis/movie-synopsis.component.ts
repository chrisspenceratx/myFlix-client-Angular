import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-movie-synopsis',
  templateUrl: './movie-synopsis.component.html',
  styleUrls: ['./movie-synopsis.component.scss']
})
export class MovieSynopsisComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<MovieSynopsisComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      Title: string;
      Description: string;
      Actors: string;
      ReleaseYear: string;
    }
  ) { }

  ngOnInit(): void {
  }
}