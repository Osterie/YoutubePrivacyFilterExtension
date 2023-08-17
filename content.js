chrome.runtime.onMessage.addListener(function(message) {
    if (message.sender === "init"){ 
        main()
    }
});

async function main(){

    const product_codes_elements = await wait_for_elements('.product__code');
    const product_codes = Array.from(product_codes_elements).map(element => element.textContent);
    const product_codes_stringified = product_codes.toString();

    const api_endpoint = "https://osterie.azurewebsites.net/api/Beverages"
    const beverage_all_info_string = await postData(api_endpoint, product_codes_stringified).then((response) => {
        return response; 
    })

    let div_target_areas = await wait_for_elements(".info-container")

    const beverages_all_info_matrix = store_csv(beverage_all_info_string, ";", "\n")

    const target_values = find_values_matrix(beverages_all_info_matrix, product_codes)
    const target_alcohol_value_ratios = target_values[1]
    const target_alcohol_percentages = target_values[2]

    const value_ratio_divs = []
    const alcohol_percentage_divs = []

    for (let i = 0; i < target_alcohol_percentages.length; i++) {
        let value_ratio_text 
        let alcohol_percentage_text
        let percentage = scale_number((target_alcohol_value_ratios[i]), 7.66, 20)
        
        let background_color;
        if (percentage < 25){
             background_color = "rgba(255, 255, 255, 1)"
        }
        else{
             background_color = "rgba(0, 0, 0, 1)"
        }

        let value_ratio_style = [{ property: 'color', value: percentage_to_color( (target_alcohol_value_ratios[i]), 7.66, 20) }, { property: 'background-color', value: background_color }];

        if (target_alcohol_value_ratios[i] && target_alcohol_percentages[i]) {
            value_ratio_text = "Alkoholøkonomisk vurdering: " + target_alcohol_value_ratios[i] 
            alcohol_percentage_text = "Alkoholprosent: " + target_alcohol_percentages[i];
        }
        else{
            value_ratio_text = "Alkoholøkonomisk vurdering: unknown";
            alcohol_percentage_text = "Alkoholprosent: unknown";
        }

        value_ratio_divs.push(create_div(value_ratio_text, "value_ratios", value_ratio_style))
        alcohol_percentage_divs.push(create_div(alcohol_percentage_text, "alcohol_percentages"))
    }

    manipulate_DOM([value_ratio_divs, alcohol_percentage_divs], div_target_areas, product_codes)
}  

// searches one of the arrays for values matching given array,
// finds all matching and returns the arrays in the same 2d array position
function find_values_matrix(matrix_array, search_array){
    const found_arrays_values_matrix = []

    for (let i = 0; i < matrix_array.length; i++) {
        found_arrays_values_matrix.push([])
    }

    for (let i = 0; i < search_array.length; i++) {

        const goal_index = matrix_array[0].indexOf(search_array[i])

        for (let j = 0; j < found_arrays_values_matrix.length; j++) {
            found_arrays_values_matrix[j].push(matrix_array[j][goal_index])
        }
    }
    return found_arrays_values_matrix
}

function create_div(text, class_name, styles){

    const div = document.createElement("div");
    div.innerText = text;
    div.classList.add(class_name);

    if (!styles){
        return div
    }

    for (let i = 0; i < styles.length; i++) {
        const style = styles[i];
        div.style[style.property] = style.value;
    }
    return div
}

function manipulate_DOM(divs_matrix, target_elements, parent_element_ids) {

    let i = 0;
    target_elements.forEach((target_element) => {

        // avoids creating the target_element if it already exists, 
        avoid_duplicate_elements(parent_element_ids[i])

        const parent = document.createElement("div");
        parent.id = parent_element_ids[i];
        target_element.appendChild(parent);

        for (let j = 0; j < divs_matrix.length; j++) {
            parent.appendChild(divs_matrix[j][i]);
        }
        i += 1;
      });
}

function avoid_duplicate_elements(element_id){
    if (document.getElementById(element_id)) {
        document.getElementById(element_id).remove();
    }
}

// waits for elements to be present and proceeds to scrape them
function wait_for_elements(selector) {
    return new Promise(resolve => {
        if (document.querySelectorAll(selector).length) {
            return resolve(document.querySelectorAll(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelectorAll(selector).length) {
                resolve(document.querySelectorAll(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

function equal_arrays(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
  
    for (let i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
}

function scale_number(number, lower_limit, upper_limit) {
    if (number >= upper_limit) {
      return 0;
    } 
    else if (number === lower_limit) {
      return 100;
    } 
    else if (number > lower_limit && number < upper_limit) {
      // Calculate the appropriate number based on the number range
      return ((upper_limit - number) / (upper_limit - lower_limit)) * 100;
    } 
    else {
      // Handle other cases as needed
      return -1;
    }
}

// creates a color which is from red to yellow to green,
// decided by lower_limit and upper_limit (lower_limit being green and upper red)
function percentage_to_color(percentage, lower_limit, upper_limit) {
    const scaled_percentage = scale_number(percentage, lower_limit, upper_limit)
    let r, g, b = 0;
	if(scaled_percentage < 50) {
		r = 255;
		g = Math.round(5.1 * scaled_percentage);
	}
	else {
		g = 255;
		r = Math.round(510 - 5.10 * scaled_percentage);
	}
	const hexadecimal_value = r * 0x10000 + g * 0x100 + b * 0x1;
	return '#' + ('000000' + hexadecimal_value.toString(16)).slice(-6);
}

//create a 2d array and stores each column in its own array (in the 2d array)
function store_csv(csv, value_seperator, line_seperator){
    // splits csv into array with all the rows as elements
    csv = csv.split(line_seperator)
    const name_values = csv[0].split(value_seperator)

    // splits csv into 2d array with each array being a row,
    // and each array containing values in each row
    for (let i = 0; i < csv.length; i++) {
        csv[i] = csv[i].split(value_seperator) 
    }

    // creates an array containing arrays, which contain all row values for certain column
    const column_array = new Array(name_values.length)
    for (let i = 0; i < name_values.length; i++) {
        column_array[i] = new Array(name_values.length)
        for (let j = 0; j < csv.length; j++) {
            column_array[i][j] = csv[j][i]
        }
    }
    return column_array
}

async function read_csv(csv_file, callback, value_seperator) {
    const filinnhold = await fetch_file_str(csv_file);
    return callback(filinnhold, value_seperator)
}
  
function fetch_file_str(file) {
    return fetch(file).then((response) => response.text());
}
  
async function postData(url = "", data = {}) {
    const response = await fetch(url, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json", },
        body: JSON.stringify(data),
    });
    return response.json(); 
}

function invertColor(hex, bw) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    var r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);
    if (bw) {
        // https://stackoverflow.com/a/3943023/112731
        return (r * 0.299 + g * 0.587 + b * 0.114) > 186
            ? '#000000'
            : '#FFFFFF';
    }
    // invert color components
    r = (255 - r).toString(16);
    g = (255 - g).toString(16);
    b = (255 - b).toString(16);
    // pad each with zeros and return
    return "#" + padZero(r) + padZero(g) + padZero(b);
}

function padZero(str, len) {
    len = len || 2;
    var zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
}

function getContrast50(hexcolor){
    return (parseInt(hexcolor, 16) > 0xffffff/2) ? 'black':'white';
}
function getContrastYIQ(hexcolor){
	var r = parseInt(hexcolor.substr(0,2),16);
	var g = parseInt(hexcolor.substr(2,2),16);
	var b = parseInt(hexcolor.substr(4,2),16);
	var yiq = ((r*299)+(g*587)+(b*114))/1000;
	return (yiq >= 128) ? 'black' : 'white';
}