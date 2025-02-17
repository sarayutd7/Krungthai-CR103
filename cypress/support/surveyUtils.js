Cypress.Commands.add('logTestStep', (stepDescription) => {
    cy.log(`Find: ${stepDescription}`);
});

const checkText = (text) => {
    cy.log(`Step Check Wording: ${text}`);
    cy.contains(text).should('exist'); // ตรวจสอบว่าข้อความมีอยู่ในหน้าเว็บ
};

function checkTextInBody(selector, searchTextArray, logMessage) {
    cy.get(selector).each(($el) => {
        cy.wrap($el).then(($group) => {
            const groupText = $group.text().trim();
            cy.logTestStep("ข้อความใน group:", groupText); // ใช้ console.log ในการตรวจสอบ
            searchTextArray.forEach((searchText) => {
                if (groupText.includes(searchText.trim())) {
                    cy.logTestStep(` - พบข้อความ: ${searchText}`);
                    return false; // หยุดการวนลูปเมื่อเจอข้อความที่ต้องการ
                } else {
                    cy.logTestStep(`ข้อความไม่พบ: ${searchText}`); // log ข้อความที่ไม่พบ
                }
            });
        });
    });
}

function processBlock(block, surveyData) {
    if (block.blockActive === true) {

        // ตรวจสอบข้อความใน blockContent
        if (block.blockContent && block.blockContent.length > 0) {
            block.blockContent.forEach(content => {
                if (content.text) {
                    // ตรวจสอบข้อความ
                    cy.wait(3000); // รอ 3 วินาที (หรือปรับเวลาให้เหมาะสม)
                    checkTextInBody(`body`, content.text, `${content.text}`);
                }

                if (content.image) {
                    // ตรวจสอบว่าภาพมีอยู่ใน DOM โดยใช้ src
                    let imageSrc = content.image.src; // ใช้ src จาก content.image
                    let imageHyperLink = content.image.href; // Corrected variable name to match its usage
                
                    cy.get(`img[src="${imageSrc}"]`).should('exist').then(($img) => {
                        const imgWidth = $img.width(); // ขนาดกว้าง
                        const imgHeight = $img.height(); // ขนาดสูง
                
                        // ตรวจสอบว่าขนาดมีค่ามากกว่า 0
                        expect(imgWidth).to.be.greaterThan(0);
                        expect(imgHeight).to.be.greaterThan(0);
                
                        // เช็ค href เฉพาะเมื่อมีข้อมูล
                        if (imageHyperLink) {
                            // Log ขนาดของภาพ
                            cy.log(`Image dimensions: src="${imageSrc}", Width = ${imgWidth}px, Height = ${imgHeight}px, href = ${imageHyperLink}`);
                            
                            // ตรวจสอบ href ของ anchor tag ที่ห่อหุ้มภาพ
                            cy.wrap($img) // Use cy.wrap to wrap the jQuery element
                              .parent('a') // Get the parent anchor tag
                              .should('have.attr', 'href', imageHyperLink); // Check that it has the correct href
                        } else {
                            // Log ขนาดของภาพ if href is undefined or empty
                            cy.log(`Image dimensions: src="${imageSrc}", Width = ${imgWidth}px, Height = ${imgHeight}px. No href found, passing the check.`);
                        }
                    });
                }
                
            });
        }


        if (block.choices) {
            block.choices.forEach(choice => {
                if (choice.status === "x") {
                    // เช็คประเภท input ก่อนทำการคลิก
                    if (choice.inputType === "button") {
                        cy.get(`#${choice.inputId}`).click();
                        cy.wait(1500);
                    } else if (choice.inputType === "checkbox" || choice.inputType === "radio") {
                        if (choice.objectType === "multiple") {
                            cy.get(`#${choice.inputId}`).check({
                                force: true
                            });
                            // ตรวจสอบว่า appendText มีอยู่หรือไม่
                            if (choice.appendText && choice.appendText.inputId) {
                                cy.get(`#${choice.appendText.inputId}`)
                                    .type(`${choice.appendText.text}`)
                                    .should('have.value', `${choice.appendText.text}`);
                                cy.get(`${choice.appendText.clickClass}`).click({
                                    force: true
                                });
                                cy.wait(1500);

                            } else {
                                console.warn('appendText หรือ inputId ไม่พบใน choice:', choice);
                                cy.wait(1500);
                            }
                        } else {
                            cy.get(`#${choice.inputId}`).check({
                                force: true
                            });
                            cy.wait(1500);
                        }
                    }
                }
            });
        }

        // ตรวจสอบว่ามี shortscreen
        if (block.screenshot === "x") {
            cy.screenshot(`${surveyData.survey.surveyTitle}/${block.blockId}/${block.blockTitle}`);
        }

        // ตรวจสอบและคลิกปุ่มหลังจากเลือก choice เสร็จ
        if (block.buttons) {
            block.buttons.forEach(button => {
                if (button.status === "x") {
                    cy.get(`button.${button.class}`).click();
                    cy.wait(2000); // รอ 2 วินาทีหลังจากคลิกปุ่ม
                }
            });
        }

        // ตรวจสอบว่ามี pause หลังจาก block นี้หรือไม่
        if (block.pause === "x") {
            cy.pause();
        }

        // ตรวจสอบว่า block ต่อไปคืออะไร และทำการไปยัง block ถัดไป
        if (block.buttons && block.buttons.some(button => button.action === "goToNext")) {
            const nextStep = block.buttons.find(button => button.action === "goToNext").nextStep;
            cy.log(`Going to the next step: ${nextStep}`);
        }

    }
}
 
//function toggleCheckboxStep(ObjectID, button_previous, button_next){
function toggleCheckboxStep(buttonLabel){
    //cy.get(ObjectID).check({force: true});
    cy.contains(buttonLabel, { timeout: 10000 }).then(($button) => {
        if ($button.length > 0) {
          cy.wrap($button).click();
        }
      });
    cy.wait(1000);
    
    // cy.contains(button_previous).then(($button) => {
    //     if ($button.length > 0) {
    //       cy.wrap($button).click();
    //     }
    //   }); 
   // cy.get(ObjectID).check({force: true});
}

export { checkText, checkTextInBody, processBlock, toggleCheckboxStep  };