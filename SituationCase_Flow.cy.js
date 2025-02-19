import {
    checkText,
    checkTextInBody,
    processBlock,
    toggleCheckboxStep
} from '../support/surveyUtils';

describe('CR103', () => {
    let surveyData;
    let checkOther = Cypress.env('textNural'); //'๓๘0XPฮp5ฆKnreFjจขHXจมผUA๗j';
    let title = '';

    const situations = {
        'SituationCase1': {
            fixtureFile: '../fixtures/SituationCase1.json',
            it_title: 'CR103: Q1A >> Q3A >> Q4A >> Q5 >> Q6 >> Q7 >> Q8'
        },
        'SituationCase2': {
            fixtureFile: '../fixtures/SituationCase2.json',
            it_title: 'CR103: Q1A >> Q3A >> Q4B >> Q5 >> Q6 >> Q7 >> Q8'
        },
        'SituationCase3': {
            fixtureFile: '../fixtures/SituationCase3.json',
            it_title: 'CR103: Q1A >> Q3A >> Q4C >> Q5 >> Q6 >> Q7 >> Q8'
        },
        'SituationCase4': {
            fixtureFile: '../fixtures/SituationCase4.json',
            it_title: 'CR103: Q1B >> Q3A >> Q4A >> Q5 >> Q6 >> Q7 >> Q8'
        },
        'SituationCase5': {
            fixtureFile: '../fixtures/SituationCase5.json',
            it_title: 'CR103: Q1C >> Q3A >> Q4A >> Q5 >> Q6 >> Q7 >> Q8'
        },
        'SituationCase6': {
            fixtureFile: '../fixtures/SituationCase1.json',
            it_title: 'CR103: Q1B >> Q3A >> Q4B >> Q3B >> Q5 >> Q6 >> Q7 >> Q8'
        },
        'SituationCase7': {
            fixtureFile: '../fixtures/SituationCase2.json',
            it_title: 'CR103: Q1C >> Q3A >> Q4B >> Q3B >> Q5 >> Q6 >> Q7 >> Q8'
        },
        'SituationCase8': {
            fixtureFile: '../fixtures/SituationCase3.json',
            it_title: 'CR103: Q1B >> Q3A >> Q4C >> Q3B >> Q5 >> Q6 >> Q7 >> Q8'
        },
        'SituationCase9': {
            fixtureFile: '../fixtures/SituationCase4.json',
            it_title: 'CR103: Q1C >> Q3A >> Q4C >> Q3B >> Q5 >> Q6 >> Q7 >> Q8'
        },
        'SituationCase10': {
            fixtureFile: '../fixtures/SituationCase5.json',
            it_title: 'CR103: Q1D >> Q4A >> Q5 >> Q6 >> Q7 >> Q8'
        },
        'SituationCase11': {
            fixtureFile: '../fixtures/SituationCase4.json',
            it_title: 'CR103: Q1D >> Q4A >> Q3B >> Q5 >> Q6 >> Q7 >> Q8'
        },
        'SituationCase12': {
            fixtureFile: '../fixtures/SituationCase5.json',
            it_title: 'CR103: Q1D >> Q4A >> Q3B >> Q5 >> Q6 >> Q7 >> Q8'
        }
    };

    const loadFixture = (situation) => {
        const { fixtureFile } = situations[situation]; 

        cy.fixture(fixtureFile).then((data) => {
            surveyData = data;
            const fullUrl = Cypress.env('UAT1');
            cy.visit(fullUrl);
            cy.reload();
            cy.viewport(
                Cypress.config('viewportWidth'),
                Cypress.config('viewportHeight')
            );
        });
    };

    const titlename = (situation) => {
        const { it_title } = situations[situation]; 
        return it_title;
    }

    const runTest = () => {
        surveyData.survey.blocks.forEach((block) => {
            if (block.blockActive === true) {
                if (block.blockContent && block.blockContent.length > 0) {
                    block.blockContent.forEach(content => {
                        if (content.text) {
                            cy.wait(3000);
                            checkTextInBody(`body`, content.text, `${content.text}`);
                        }
                        if (content.image) {
                            let imageSrc = content.image.src;
                            let imageHyperLink = content.image.href;
                            cy.get(`img[src="${imageSrc}"]`).should('exist').then(($img) => {
                                cy.wrap($img).should(() => {
                                    return new Cypress.Promise((resolve, reject) => {
                                        const img = $img[0];
                                        if (img.complete && img.naturalWidth > 0) {
                                            resolve();
                                        } else {
                                            img.onload = () => {
                                                resolve();
                                            };
                                            img.onerror = reject;
                                        }
                                    });
                                }).then(() => {
                                    const imgWidth = $img.width();
                                    const imgHeight = $img.height();
                                    expect(imgWidth).to.be.greaterThan(0);
                                    expect(imgHeight).to.be.greaterThan(0);
                                    if (imageHyperLink) {
                                        cy.log(`Image dimensions: src="${imageSrc}", Width = ${imgWidth}px, Height = ${imgHeight}px, href = ${imageHyperLink}`);
                                        cy.wrap($img).parent('a').should('have.attr', 'href', imageHyperLink);
                                    } else {
                                        cy.log(`Image dimensions: src="${imageSrc}", Width = ${imgWidth}px, Height = ${imgHeight}px. No href found, passing the check.`);
                                    }
                                });
                            });
                        }
                    });
                }
                if (block.choices) {
                    block.choices.forEach(choice => {
                        cy.log(`###### ${block.blockType} ######`);
                        if (choice.status === "x") {
                            const currentTime = new Date().toLocaleTimeString();
                            cy.log(`Current Time: ${currentTime}`);
                            if (choice.inputType === "button") {
                                cy.log(`click button`);
                                cy.get(`button.${choice.inputId}`).click();
                                cy.wait(1000);
                            } else if (choice.inputType === "checkbox" || choice.inputType === "radio" || choice.inputType === 'data-value' || choice.inputType === 'textarea') {
                                if (choice.objectType === "multiple") {
                                    cy.get(`${choice.inputId}`).check({
                                        force: true
                                    });
                                    if (choice.appendText && choice.appendText.inputId) {
                                        cy.get(`${choice.appendText.inputId}`).type(`${checkOther}`).should('have.value', `${checkOther}`);
                                        cy.get(`${choice.appendText.clickClass}`).click({
                                            force: true
                                        });
                                    } else {
                                        console.warn('appendText หรือ inputId ไม่พบใน choice:', choice);
                                    }
                                } else {
                                    if (choice.inputType === 'data-value') {
                                        cy.get(`${choice['getParentID']}`).find(`${choice['inputId']}[data-value="${choice['data-value']}"]`).click();
                                    } else if (choice.inputType === 'textarea') {
                                        cy.get(`${choice['getParentID']}`).find(`${choice.inputId}`).type(`${checkOther}`).should('have.value', `${checkOther}`);
                                    } else if (choice.inputType === "checkbox") {
                                        cy.get(`${choice.inputId}`).check({
                                            force: true
                                        });
                                    } else {
                                        cy.get(`${choice.inputId}`).check({
                                            force: true
                                        });
                                        cy.wait(1000);
                                    }
                                }
                            } else {
                                if (choice.inputType === 'div') {
                                    cy.get(`${choice.inputId}`).contains(`${choice.labelText}`).click();
                                }
                            }
                            cy.get('.survey').click();
                        }
                    });
                }
                if (block.screenshot === "x") {
                    //cy.screenshot(`${surveyData.survey.surveyTitle}/${block.blockId}/${block.blockTitle}`);
                }
                if (block.buttons) {
                    block.buttons.forEach(button => {
                        if (button.status === "x") {
                            cy.get(`button.${button.class}`).click();
                            cy.wait(1000);
                        }
                    });
                }
                if (block.pause === "x") {
                    cy.pause();
                }
                if (block.buttons && block.buttons.some(button => button.action === "goToNext")) {
                    const nextStep = block.buttons.find(button => button.action === "goToNext").nextStep;
                    cy.log(`Going to the next step: ${nextStep}`);
                }
            }
        });
    };

    Object.keys(situations).forEach(situation => {
        describe(situation, () => { 
            beforeEach(() => {
                loadFixture(situation);
            });

            title = titlename(situation);

            it(`${situation} - ${title}`, () => {
                runTest();
            });
        });
    });
});