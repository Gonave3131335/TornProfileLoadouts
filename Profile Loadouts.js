// ==UserScript==
// @name         Profile Loadouts
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Displays loadout information on profile page
// @author       Dexterity [3131335]
// @match        https://www.torn.com/profiles.php?XID=*
// @grant        GM_xmlhttpRequest
// @connect      dystopia.tornbot.com
// ==/UserScript==

(function() {
    'use strict';

    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('XID');
    const APIKey = ''; // Replace with your API key

    if (!userId) {
        console.error("User ID not found in the URL.");
        return;
    }

    const apiUrl = `https://dystopia.tornbot.com/api/v1/LoadOut/${userId}?key=${APIKey}`;

    const colorMap = {
        0: '#d3d3d3', // light grey
        1: '#f1f154', // yellow
        2: '#eb8a27', // orange
        3: '#ED7E7E'  //red
    };

    GM_xmlhttpRequest({
        method: 'GET',
        url: apiUrl,
        onload: function(response) {
            if (response.status === 200) {
                const data = JSON.parse(response.responseText);

                const div = document.createElement('div');
                div.className = 'profile-wrapper medals-wrapper m-top10';
                div.style.marginTop = '10px';

                const banner = document.createElement('div');
                banner.className = 'title-black top-round';
                banner.textContent = 'Loadout Information';

                const tableContainer = document.createElement('div');
                tableContainer.className = 'cont bottom-round cont-gray';
                tableContainer.style.padding = '10px';

                const table = document.createElement('table');
                table.style.borderCollapse = 'collapse';
                table.style.width = '100%';
                table.style.height = '100%';
                table.style.backgroundColor = '#f5f5f5';
                table.style.borderRadius = '0px';

                const headers1 = ['Helmet', 'Armor', 'Pants', 'Gloves', 'Boots'];
                const headers2 = ['Primary', 'Secondary', 'Melee', 'Temp', 'Spy Date'];

                const headerStyle = {
                    border: '1px solid #000',
                    padding: '10px',
                    textAlign: 'center',
                    backgroundColor: '#ddd',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    color: '#000',
                    textShadow: '1px 1px 2px #fff',
                };

                function createHeaderCell(text) {
                    const headerCell = document.createElement('th');
                    headerCell.textContent = text;
                    Object.assign(headerCell.style, headerStyle);
                    return headerCell;
                }

                const headerRow1 = document.createElement('tr');
                headers1.forEach(headerText => {
                    const headerCell = createHeaderCell(headerText);
                    headerRow1.appendChild(headerCell);
                });

                const headerRow2 = document.createElement('tr');
                headers2.forEach(headerText => {
                    const headerCell = createHeaderCell(headerText);
                    headerRow2.appendChild(headerCell);
                });

                function formatArmorText(item) {
                    let text = `${item.name}<br>Armor: ${item.armor.toFixed(2)}`;
                    if (item.bonuses && item.bonuses.length > 0) {
                        item.bonuses.forEach(bonus => {
                            text += `<br>${bonus.title} ${bonus.value}%`;
                        });
                    }
                    return text;
                }


                function formatWeaponText(item) {
                    let text = `${item.name}<br>DMG: ${item.damage.toFixed(2)}<br>ACC: ${item.accuracy.toFixed(2)}`;
                    if (item.bonuses && item.bonuses.length > 0) {
                        item.bonuses.forEach(bonus => {
                            text += `<br>${bonus.title} ${bonus.value}%`;
                        });
                    }
                    return text;
                }

                const dataRow1 = document.createElement('tr');
                const dataRow2 = document.createElement('tr');

                const armorKeys = ['helmetArmor', 'chestArmor', 'pantsArmor', 'glovesArmor', 'bootsArmor'];
                armorKeys.forEach(key => {
                    const cell = document.createElement('td');
                    if (data[key]) {
                        const item = data[key];
                        cell.innerHTML = formatArmorText(item);
                        if (item.color !== undefined) {
                            cell.style.backgroundColor = colorMap[item.color] || '#ffffff'; 
                        }
                    } else {
                        cell.textContent = 'N/A';
                    }
                    cell.style.border = '1px solid #000';
                    cell.style.padding = '10px';
                    cell.style.textAlign = 'center';
                    cell.style.verticalAlign = 'top'; 
                    dataRow1.appendChild(cell);
                });

                const weaponsKeys = ['primaryWeapon', 'secondaryWeapon', 'meleeWeapon'];
                weaponsKeys.forEach((key, index) => {
                    const cell = document.createElement('td');
                    if (data[key]) {
                        const weapon = data[key];
                        cell.innerHTML = formatWeaponText(weapon);
                        if (weapon.color !== undefined) {
                            cell.style.backgroundColor = colorMap[weapon.color] || '#ffffff'; 
                        }
                    } else {
                        cell.textContent = 'N/A';
                    }
                    cell.style.border = '1px solid #000';
                    cell.style.padding = '10px';
                    cell.style.textAlign = 'center';
                    cell.style.verticalAlign = 'top'; 
                    dataRow2.appendChild(cell);
                });

                const tempCell = document.createElement('td');
                tempCell.textContent = data.tempWeapon ? data.tempWeapon.name : 'N/A';
                if (data.tempWeapon && data.tempWeapon.color !== undefined) {
                    tempCell.style.backgroundColor = colorMap[data.tempWeapon.color] || '#ffffff';
                }
                tempCell.style.border = '1px solid #000';
                tempCell.style.padding = '10px';
                tempCell.style.textAlign = 'center';
                tempCell.style.verticalAlign = 'middle';
                dataRow2.appendChild(tempCell);

                const spyDateCell = document.createElement('td');
                spyDateCell.textContent = new Date(data.timestamp).toLocaleDateString();
                spyDateCell.style.border = '1px solid #000';
                spyDateCell.style.padding = '10px';
                spyDateCell.style.textAlign = 'center';
                spyDateCell.style.verticalAlign = 'middle';
                dataRow2.appendChild(spyDateCell);

                table.appendChild(headerRow1);
                table.appendChild(dataRow1);
                table.appendChild(headerRow2);
                table.appendChild(dataRow2);

                tableContainer.appendChild(table);
                div.appendChild(banner);
                div.appendChild(tableContainer);

                const targetElement = document.querySelector('.profile-wrapper');
                if (targetElement) {
                    targetElement.appendChild(div);
                } else {
                    console.error("Target element not found.");
                }
            } else {
                console.error("Error fetching data:", response.statusText);
            }
        },
        onerror: function(error) {
            console.error("Request failed:", error);
        }
    });
})();
