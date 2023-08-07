import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgToastService } from 'ng-angular-popup';
import { MovieService } from 'src/app/services/movie.service';
import { DatePipe } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-add-seance',
  templateUrl: './add-seance.component.html',
  styleUrls: ['./add-seance.component.scss'],
})
export class AddSeanceComponent implements OnInit {
  seanceForm!: FormGroup;
  movies: any[] = [];
  seances: any[] = [];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);

  displayedColumns: string[] = ['dateStart', 'dateEnd', 'movieTitle'];
  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  constructor(
    private fb: FormBuilder,
    private movieService: MovieService,
    private toast: NgToastService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.seanceForm = this.fb.group({
      dateStart: ['', Validators.required],
      movieId: ['', Validators.required],
    });

    this.loadMovies();
    this.loadSeances();

    this.dataSource = new MatTableDataSource<any>([]);
    this.seanceForm.get('movieId')?.valueChanges.subscribe((movieId) => {
      this.filterByMovieTitle(movieId);
    });
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  loadMovies() {
    this.movieService.getAllMovies().subscribe((data) => {
      this.movies = data;

      if (this.movies.length === 0) {
        this.toast.error({
          detail: 'ERROR',
          summary: 'No movies',
          duration: 5000,
        });
      } else {
        this.toast.success({
          detail: 'SUCCESS',
          summary: 'Movies loaded',
          duration: 3000,
        });
      }
    });
  }

  loadSeances() {
    this.movieService.getAllSeances().subscribe((data) => {
      this.seances = data;

      this.seances.forEach((seance) => {
        seance.dateStart = new Date(seance.dateStart);
        seance.dateEnd = new Date(seance.dateEnd);
      });

      this.dataSource.data = this.seances;
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.dataSource._updateChangeSubscription();

      const movieId = this.seanceForm.get('movieId')?.value;
      this.filterByMovieTitle(movieId);
    });
  }

  onSubmit() {
    if (this.seanceForm.valid) {
      console.log('Form submitted:', this.seanceForm.value);

      this.movieService.addSeance(this.seanceForm.value).subscribe(
        (res) => {
          this.toast.success({
            detail: 'SUCCESS',
            summary: res.message,
            duration: 5000,
          });
          this.seanceForm.reset();
          this.loadSeances();
        },
        (err: any) => {
          this.toast.error({
            detail: 'ERROR',
            summary: err.error.message,
            duration: 5000,
          });
        }
      );
    } else {
      console.log('Form is not valid');
    }
  }

  reset() {
    this.seanceForm.reset();
  }

  filterByMovieTitle(movieId: number) {
    if (movieId) {
      const selectedMovie = this.movies.find((movie) => movie.id === movieId);
      const movieTitle = selectedMovie ? selectedMovie.title : '';

      this.dataSource.filter = movieTitle.trim().toLowerCase();
    } else {
      this.dataSource.filter = '';
    }
  }
}
