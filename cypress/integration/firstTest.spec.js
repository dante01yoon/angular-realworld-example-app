/// <reference types="cypress"/>

const { copyFileSync } = require("fs");
const { text } = require("stream/consumers");

describe('Test with backend', () => {
  beforeEach('login to the app', () => {
    cy.loginToApplication();
    cy.intercept({method: 'Get', path: 'tags'}, {fixture: text.json})
  })

  it.skip('verify correct request and response', () => {

    cy.server();
    cy.route('POST', '**/articles').as('postArticles')
    let time = new Date().getTime();
    cy.contains('New Article').click();
    cy.get('[formcontrolname="title"]').type('This is a title created at-'+time);
    cy.get('[formcontrolname="description"]').type('This is a description');
    cy.get('[formcontrolname="body"]').type('This is a body of the Article');
    cy.contains('Publish Article').click();

    cy.wait('@postArticles')
    cy.get('@postArticles').then(xhr => {
      console.log(xhr)
      expect(xhr.response.statusCode).to.equal(200);
      expect(xhr.request.body.article.body).to.equal('This is a body of the Article');
      expect(xhr.response.body.article.description).to.equal('This is a description');
    })
  })
  
  it.skip('should gave tags with routing object', () => {
    cy.get('.tag-list')
      .should('contain', 'cypress')
      .and('contain','automation')
      .and('contain', 'testing')
  })
  
  it('delete a new article', () => {
    const userCredentials = {
      "user": {
        "email": "dante01yoon@gmail.com",
        "password": "1234"
      }
    }

    cy.request('POST', 'https://conduit.productionready.io/api/users/login', userCredentials)
      .its('body')
      .then(body => {
        const token = { body: { user }};
        
        const bodyRequest = {
          "article": {
            "tagList": [],
            "title": "Request from API",
            "description": "API testing is easy",
            "body": "Angular is cool"
          }
        }

        cy.request({
          url: 'https://conduit.productionready.io/api/articles/',
          headers: {
            'Authorization': `Token ${token}`,
            method: 'POST',
            body: bodyRequest,
          }
        }).then( response => {
          expect(response.status.code).to.equal(200)
        })

        cy.contains('Global Feed').click()
        cy.get('.article-preview').first().click()
        cy.get('.article-preview').contains("Delete Article").click();

        // end of it
      })

  })

})


