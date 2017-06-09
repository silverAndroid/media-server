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
    @Input()
    expanded: boolean;
    overviewClass;
    imgStyle;

    constructor() {
    }

    ngOnInit() {
        if (this.expanded) {
            this.overviewClass = '';
            this.imgStyle = {width: '100px', margin: '0 16px 0 0', float: 'left'};
        }
        else {
            this.overviewClass = 'overview';
            this.imgStyle = {};
        }
    }

}
