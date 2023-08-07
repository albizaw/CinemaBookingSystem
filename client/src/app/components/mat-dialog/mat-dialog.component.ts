import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MovieService } from 'src/app/services/movie.service';
import { MatDialogSummaryComponent } from '../mat-dialog-summary/mat-dialog-summary.component';
import { NgToastService } from 'ng-angular-popup';

@Component({
  selector: 'app-mat-dialog',
  templateUrl: './mat-dialog.component.html',
  styleUrls: ['./mat-dialog.component.scss'],
})
export class MatDialogComponent {
  selectedSeance!: string | null;
  seatRows: any[] = [];
  actualSeance: any = {};

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<MatDialogComponent>,
    private movieService: MovieService,
    private toast: NgToastService
  ) {}

  getBase64ImageSrc(): string {
    if (this.data.poster && this.data.poster.startsWith('data:image')) {
      return this.data.poster;
    }
    return `data:image/jpeg;base64,${this.data.poster}`;
  }

  updateSeatMap(): void {
    const selectedSeance = this.data.seances.find(
      (seance: any) => seance.dateStart === this.selectedSeance
    );

    console.log(selectedSeance);
    this.actualSeance = selectedSeance;
    this.seatRows = [];

    if (!selectedSeance) {
      for (let i = 1; i <= 5; i++) {
        const row = [];
        for (let j = 1; j <= 5; j++) {
          const seatNumber = (i - 1) * 5 + j;
          row.push({
            seatNumber,
            isFree: true,
            isSelected: false,
          });
        }
        this.seatRows.push(row);
      }
    } else {
      for (let i = 1; i <= 5; i++) {
        const row = [];
        for (let j = 1; j <= 5; j++) {
          const seatNumber = (i - 1) * 5 + j;
          const seat = selectedSeance.seats.find(
            (seat: any) => seat.seatNumber === seatNumber
          );
          row.push({
            seatNumber,
            isFree: seat ? seat.isFree : true,
            isSelected: false,
          });
        }
        this.seatRows.push(row);
      }
    }
  }

  onSeatClick(seat: any): void {
    if (seat.isFree) {
      seat.isSelected = !seat.isSelected;
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  resetSelection(): void {
    this.selectedSeance = null;

    for (let i = 0; i < this.seatRows.length; i++) {
      for (let j = 0; j < this.seatRows[i].length; j++) {
        this.seatRows[i][j].isSelected = false;
      }
    }
  }

  getSelectedPlaces(): number[] {
    const selectedPlaces: number[] = [];
    for (const row of this.seatRows) {
      for (const seat of row) {
        if (seat.isSelected) {
          selectedPlaces.push(seat.seatNumber);
        }
      }
    }
    return selectedPlaces;
  }

  openSummaryDialog(): void {
    const selectedPlaces = this.getSelectedPlaces();
    if (selectedPlaces.length > 0) {
      const dialogRef = this.dialog.open(MatDialogSummaryComponent, {
        data: {
          movieTitle: this.data.title,
          seanceDate: this.selectedSeance,
          selectedSeats: selectedPlaces,
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result === 'confirm') {
          const order = {
            seanceId: this.actualSeance.id,
            selectedPlaces: this.getSelectedPlaces(),
          };

          this.movieService.addOrder(order).subscribe(
            (res) => {
              console.log(res.message);
              this.toast.success({
                detail: 'SUCCESS',
                summary: res.message,
                duration: 5000,
              });

              this.dialogRef.close('orderSubmitted');
            },
            (err) => {
              this.toast.error({
                detail: 'ERROR',
                summary: err.error.message,
                duration: 5000,
              });
            }
          );
        }
      });
    } else {
      this.toast.error({
        detail: 'ERROR',
        summary: 'Select places first!',
        duration: 2000,
      });
    }
  }
}
