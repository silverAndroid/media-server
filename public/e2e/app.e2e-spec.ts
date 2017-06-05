import { PublicPage } from './app.po';

describe('public App', () => {
  let page: PublicPage;

  beforeEach(() => {
    page = new PublicPage();
  });

  it('should display welcome message', done => {
    page.navigateTo();
    page.getParagraphText()
      .then(msg => expect(msg).toEqual('Welcome to app!!'))
      .then(done, done.fail);
  });
});
