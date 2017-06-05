/**
 * Created by silver_android on 6/5/2017.
 */
export class HTTPConnection {
    public static extractData(res: Response) {
        return res.json();
    }
}