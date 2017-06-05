import {Component, OnInit} from "@angular/core";
import {Episode} from "../episode";
import {ShowsService} from "../shows.service";
import {ActivatedRoute} from "@angular/router";

@Component({
    selector: 'app-page-episodes',
    templateUrl: './page-episodes.component.html',
    styleUrls: ['./page-episodes.component.css']
})
export class PageEpisodesComponent implements OnInit {

    private _numCols: number;
    private _showID: number;
    rows: Episode[][];
    loading: boolean;

    constructor(private _showsService: ShowsService, private _route: ActivatedRoute) {
        this._numCols = 4;
        this.rows = [];
        this.loading = false;
    }

    ngOnInit() {
        this._route.params
            .switchMap(params => {
                this._showID = params.id;
                return this._showsService.getEpisodes(this._showID, params.season)
            })
            .subscribe(episodes => {
                episodes.forEach((episode, i) => {
                    if (i % this._numCols === 0)
                        this.rows.push([]);
                    this.rows[Math.floor(i / this._numCols)].push(new Episode(episode.episode, episode.image_url, episode.overview));
                });
                this.loading = false;
            })
    }

}
