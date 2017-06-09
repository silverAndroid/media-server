import {Component, OnInit} from "@angular/core";
import {ShowsService} from "../shows.service";
import {Show} from "../show";

@Component({
    selector: 'page-shows',
    templateUrl: './page-shows.component.html',
    styleUrls: ['./page-shows.component.css']
})
export class PageShowsComponent implements OnInit {

    private _numCols: number;
    loading: boolean;
    rows: Show[][];

    constructor(private _showsService: ShowsService) {
        this._numCols = 4;
        this.loading = true;
        this.rows = [];
    }

    ngOnInit() {
        this._showsService.getShows().subscribe(
            shows => {
                shows.forEach((show, i) => {
                    if (i % this._numCols === 0)
                        this.rows.push([]);
                    this.rows[Math.floor(i / this._numCols)].push(new Show(show.name, show.image_url, show.overview, show.id));
                });
                this.loading = false;
            }
        );
    }

}
