import puppeteer from 'puppeteer';
import _ from "lodash";
import sanitizeHtml from 'sanitize-html';

export const getCocktail = async (name: string) => {
    // Launch the browser
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Navigate to the initial search page
    await page.goto('https://www.diffordsguide.com/cocktails/search');



    // Fill in the search keyword
    await page.type('#base-keyword', name); // Adjust the selector if necessary



    // Click on the search button and wait for the page to load
    await Promise.all([
        page.waitForNavigation(),
        page.click('#search-submit'), // Adjust the selector if necessary
    ]);



    // Click on the specific cocktail link and wait for the page to load
    await page.waitForSelector('a.box'); // Ensure the links are loaded

    await Promise.all([
        page.waitForNavigation(),
        page.$eval(`a.box[href*="/${_.kebabCase(name)}"]`, (el) => el.click()),
    ]);




    // Extract data from the cocktail detail page
    const cocktailData = await page.evaluate(() => {
        const extractText = (selector: string, searchText: string) => {
            const elements = [...document.querySelectorAll(selector)];
            const targetElement = elements.find(element => element.textContent?.includes(searchText));
            return targetElement ? targetElement.nextElementSibling?.innerHTML : ''; // Adjusted to get the next sibling's innerHTML
        };
        return {
            name: document.querySelector('.strip__heading')?.textContent?.trim() ?? '',
            serveIn: extractText('.cell > h3', 'Serve in'), // Adjusted selector and added searchText
            garnish: extractText('.cell h3', 'Garnish:'), // Adjusted selector and added searchText
            method: extractText('.cell h2', 'How to make:'), // Adjusted selector and added searchText
            ingredients: Array.from(document.querySelectorAll('.ingredients-table tr')).map(row => {
                const quantity = row.querySelector('td:nth-child(1)')?.textContent?.trim();
                let ingredient = row.querySelector('td:nth-child(2)')?.textContent?.trim();

                // Clean up the ingredient text
                if (ingredient) {
                    // Remove tabs, excessive whitespace, newlines, and specific unwanted patterns
                    ingredient = ingredient.replace(/\t+/g, ' ') // Remove all tab characters
                        .replace(/\n+/g, ' ') // Replace multiple spaces with a single space
                        .replace(/\s\s+/g, ' ') // Replace multiple spaces with a single space
                        .replace(/Loading...|Servings|GO/g, '') // Remove specific unwanted text
                        .trim(); // Trim leading and trailing whitespace

                    // Handle alternatives (e.g., "or") by keeping only the first option for simplicity
                    const orIndex = ingredient.indexOf(' or');
                    if (orIndex !== -1) {
                        ingredient = ingredient.substring(0, orIndex).trim();
                    }
                }

                return { quantity, ingredient };
            })
        };
    });



    // Apply the sanitizeHtml function to each property of cocktailData that may contain HTML
    const sanitizedCocktailData = {
        ...cocktailData,
        serveIn: sanitizeHtml(cocktailData.serveIn ?? ""),
        garnish: sanitizeHtml(cocktailData.garnish ?? ""),
        method: sanitizeHtml(cocktailData.method ?? "").replace(/\b[A-Z]+\b/g, (match) => `<strong>${match}</strong>`) ?? "",
        ingredients: cocktailData.ingredients.map(ingredient => ({
            ...ingredient,
            ingredient: sanitizeHtml(ingredient.ingredient ?? "")
        })).filter((el) => !el.quantity?.includes("Loading"))
    };

    // Close the browser
    await browser.close();

    return sanitizedCocktailData;
};
