import { checkText, checkTextInBody, processBlock, toggleCheckboxStep } from '../../support/surveyUtils';

describe('CR103: Q1B >> Q3A >> Q4A >> Q5	>> Q6 >> Q7	>> Q8', () => {
    let surveyData;
    let checkOther = Cypress.env('textNural'); //'๓๘0XPฮp5ฆKnreFjจขHXจมผUA๗j';
    before(() => {
        // โหลด fixture เพียงครั้งเดียวใน before
        cy.fixture('../fixtures/SituationCase4.json').then((data) => {
            surveyData = data;
            //const fullUrl = Cypress.env('UAT');
            const fullUrl = Cypress.env('UAT1');
            // cy.visit(fullUrl);
            // cy.viewport(Cypress.env('UAT'), Cypress.env('UAT')); 

            cy.visit(fullUrl);
            cy.viewport(
                Cypress.config('viewportWidth'),
                Cypress.config('viewportHeight')
            );
            
            // รอให้หน้าโหลดเสร็จ
            cy.wait(3000); // รอ 5 วินาที (คุณสามารถปรับเวลาได้ตามความเหมาะสม)
        });
    });
    it('SituationCase#1 Flow: Q1B >> Q3A >> Q4A >> Q5 >> Q6 >> Q7 >> Q8', () => {
        // วนลูปผ่านแต่ละ block ในแบบสอบถาม
        surveyData.survey.blocks.forEach((block) => {

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
                                cy.wrap($img).should(() => {
                                  // ตรวจสอบการโหลดของรูปภาพโดยใช้ event load
                                  return new Cypress.Promise((resolve, reject) => {
                                    const img = $img[0]; // เข้าถึง element แรก
                                    if (img.complete && img.naturalWidth > 0) {
                                      resolve(); // รูปภาพโหลดเสร็จแล้ว
                                    } else {
                                      // รอ event load สำหรับรูปภาพ
                                      img.onload = () => {
                                        resolve(); // รูปภาพโหลดเสร็จแล้ว
                                      };
                                      img.onerror = reject; // กรณีเกิด error ในการโหลดรูปภาพ
                                    }
                                  });
                                }).then(() => {
                                  // ตรวจสอบขนาดของรูปภาพเมื่อโหลดเสร็จ
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
                                    cy.wrap($img) // ใช้ cy.wrap เพื่อ wrap jQuery element
                                      .parent('a') // เลือก parent anchor tag
                                      .should('have.attr', 'href', imageHyperLink); // ตรวจสอบ href
                                  } else {
                                    // Log ขนาดของภาพหากไม่มี href
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
                            // แสดง log ของเวลาปัจจุบัน (วินาที)
                            const currentTime = new Date().toLocaleTimeString(); // ดึงเวลาปัจจุบันในรูปแบบ HH:MM:SS
                            cy.log(`Current Time: ${currentTime}`);

                            // เช็คประเภท input ก่อนทำการคลิก
                            if (choice.inputType === "button") {
                                cy.log(`click button`);
                                cy.get(`button.${choice.inputId}`).click();
                                //cy.get(`#button`).find(`#${choice.inputId}`).click();
                                cy.wait(1000);
                            } else if (choice.inputType === "checkbox" || choice.inputType === "radio" || choice.inputType === 'data-value' || choice.inputType === 'textarea') {
                                if (choice.objectType === "multiple") {
                                    cy.get(`${choice.inputId}`).check({
                                        force: true
                                    }); 
                                    // toggleCheckboxStep(`ถัดไป`);
                                    // toggleCheckboxStep(`ย้อนกลับ`);
                                    // toggleCheckboxStep(`ถัดไป`);

                                    //toggleCheckboxStep(`#${choice.inputId}`,`ย้อนกลับ`,`ถัดไป`);
                                    // ตรวจสอบว่า appendText มีอยู่หรือไม่
                                    if (choice.appendText && choice.appendText.inputId) {
                                        cy.get(`${choice.appendText.inputId}`)
                                            .type(`${checkOther}`)
                                            .should('have.value', `${checkOther}`);
                                        cy.get(`${choice.appendText.clickClass}`).click({
                                            force: true
                                        });
                                        //toggleCheckboxStep(`ถัดไป`);
                                        //cy.wait(1000);

                                    } else {
                                        console.warn('appendText หรือ inputId ไม่พบใน choice:', choice);
                                        //cy.wait(1000);
                                    }
                                } else { 

                                 if(choice.inputType === 'data-value'){
                                    cy.get(`${choice['getParentID']}`)  // เลือก div ที่มี id ตรงกับที่ต้องการ
                                      .find(`${choice['inputId']}[data-value="${choice['data-value']}"]`)   // ค้นหา button ที่มี data-value="9"
                                      .click(); 
                                 }else if(choice.inputType === 'textarea'){
                                    //cy.get(`${choice['inputId']}[data-value="${choice['text']}"]`).click();  
                                    cy.get(`${choice['getParentID']}`)  // เลือก div ที่มี id ตรงกับที่ต้องการ
                                      .find(`${choice.inputId}`)   // ค้นหา button ที่มี data-value="9"
                                      .type(`${checkOther}`).should('have.value', `${checkOther}`);
                                 
                                 }else if(choice.inputType === "checkbox"){
                                        cy.get(`${choice.inputId}`).check({
                                            force: true
                                        });
                                        //toggleCheckboxStep(`ถัดไป`);
                                        //toggleCheckboxStep(`ย้อนกลับ`); 

                                 }else{
                                      cy.get(`${choice.inputId}`).check({
                                            force: true
                                        });
                                        cy.wait(1000);
                                   } 
                                
                            } 
                          }else{

                           if(choice.inputType === 'div'){
                            //cy.get(`${choice.inputId}`).click(); 
                            cy.get(`${choice.inputId}`).contains(`${choice.labelText}`).click();
                           }

                          }


                             
                          cy.get('.survey').click();


                        }
                    });
                }

                // ตรวจสอบว่ามี shortscreen
                if (block.screenshot === "x") {
                    //cy.screenshot(`${surveyData.survey.surveyTitle}/${block.blockId}/${block.blockTitle}`);
                }

                //ตรวจสอบและคลิกปุ่มหลังจากเลือก choice เสร็จ
                if (block.buttons) {
                    block.buttons.forEach(button => {
                        if (button.status === "x") {
                            //cy.get('.common_version').click();
                            cy.get(`button.${button.class}`).click();
                            cy.wait(1000); // รอ 2 วินาทีหลังจากคลิกปุ่ม
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

        });
    });
});