import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MovieService } from 'src/app/services/movie.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatDialogComponent } from '../mat-dialog/mat-dialog.component';

@Component({
  selector: 'app-movies',
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.scss'],
})
export class MoviesComponent implements OnInit {
  uniqueMovies: any[] = [];
  cols: number = 3;

  constructor(
    private dialog: MatDialog,
    private movieService: MovieService,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit(): void {
    this.loadUniqueMovies();
    console.log(this.uniqueMovies);

    this.breakpointObserver
      .observe(['(max-width:768px)'])
      .subscribe((result) => {
        this.cols = result.matches ? 1 : 3;
      });
  }

  loadUniqueMovies() {
    this.movieService.getUniqueMovies().subscribe(
      (data) => {
        this.uniqueMovies = data;
        console.log(this.uniqueMovies);
      },
      (error) => {
        console.error('Error fetching unique movies');
      }
    );
  }

  openDialog(movie: any) {
    const dialogRef = this.dialog.open(MatDialogComponent, {
      data: movie,
    });

    dialogRef.afterOpened().subscribe(() => {
      console.log('Dialog opened with data:', movie);
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'orderSubmitted') {
        this.loadUniqueMovies();
      }
    });
  }
}
