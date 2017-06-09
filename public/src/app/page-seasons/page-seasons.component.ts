import {Component, OnInit} from "@angular/core";
import {ShowsService} from "../shows.service";
import {ActivatedRoute, Params} from "@angular/router";
import {Location} from "@angular/common";
import {Season} from "../season";
import {Show} from "../show";

@Component({
    selector: 'app-page-show',
    templateUrl: './page-seasons.component.html',
    styleUrls: ['./page-seasons.component.css']
})
export class PageSeasonsComponent implements OnInit {

    private _numCols: number;
    private _showID: number;
    rows: Season[][];
    show: Show;
    loading: boolean;

    constructor(private _showsService: ShowsService, private _route: ActivatedRoute) {
        this._numCols = 4;
        this.rows = [];
        this.loading = true;
    }

    ngOnInit() {
        this._route.params
            .switchMap((params: Params) => {
                this._showID = +params.id;
                return this._showsService.getSeasons(this._showID);
            })
            .subscribe(res => {
                const show = res.show.data;
                this.show = new Show(show.name, show.image_url, show.overview);
                const seasons = res.seasons.data;
                seasons.forEach((season, i) => {
                    if (i % this._numCols === 0)
                        this.rows.push([]);
                    this.rows[Math.floor(i / this._numCols)].push(new Season(season.season, season.image_url, season.overview));
                });
                this.loading = false;
            });
    }

}
