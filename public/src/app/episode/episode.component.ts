import {Component, Input, OnInit} from "@angular/core";
import {Episode} from "../episode";

@Component({
    selector: 'episode',
    templateUrl: './episode.component.html',
    styleUrls: ['./episode.component.css']
})
export class EpisodeComponent implements OnInit {

    @Input('data')
    episode: Episode;

    constructor() {
    }

    ngOnInit() {
    }

}
