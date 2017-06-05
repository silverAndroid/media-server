import {Component, Input, OnInit} from "@angular/core";
import {Season} from "../season";

@Component({
    selector: 'season',
    templateUrl: './season.component.html',
    styleUrls: ['./season.component.css']
})
export class SeasonComponent implements OnInit {

    @Input('data')
    season: Season;

    constructor() {
    }

    ngOnInit() {
    }

}
