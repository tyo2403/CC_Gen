class CCGenerator {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.populateYearOptions();
        this.cardTypes = {
            visa: { prefix: ['4'], length: [13, 16, 19] },
            mastercard: { prefix: ['51', '52', '53', '54', '55', '2221', '2222', '2223', '2224', '2225', '2226', '2227', '2228', '2229', '223', '224', '225', '226', '227', '228', '229', '23', '24', '25', '26', '270', '271', '2720'], length: [16] },
            amex: { prefix: ['34', '37'], length: [15] },
            discover: { prefix: ['6011', '622126', '622127', '622128', '622129', '62213', '62214', '62215', '62216', '62217', '62218', '62219', '6222', '6223', '6224', '6225', '6226', '6227', '6228', '644', '645', '646', '647', '648', '649', '65'], length: [16] }
        };
        this.names = [
            'John Smith', 'Jane Doe', 'Michael Johnson', 'Sarah Williams', 'David Brown',
            'Emily Davis', 'Christopher Miller', 'Ashley Wilson', 'Matthew Moore', 'Jessica Taylor'
        ];
    }

    initializeElements() {
        // Tab elements
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');
        
        // CC Generator elements
        this.form = document.getElementById('generatorForm');
        this.binInput = document.getElementById('binInput');
        this.cardTypeSelect = document.getElementById('cardType');
        this.quantityInput = document.getElementById('quantity');
        this.expMonthSelect = document.getElementById('expMonth');
        this.expYearSelect = document.getElementById('expYear');
        this.outputFormatSelect = document.getElementById('outputFormat');
        this.detailedOptions = document.getElementById('detailedOptions');
        this.includeCvvCheckbox = document.getElementById('includeCvv');
        this.includeExpiryCheckbox = document.getElementById('includeExpiry');
        this.includeNamesCheckbox = document.getElementById('includeNames');
        this.resultsContainer = document.getElementById('results');
        this.statsContainer = document.getElementById('stats');
        this.generatedCountSpan = document.getElementById('generatedCount');
        this.validCountSpan = document.getElementById('validCount');
        this.copyBtn = document.getElementById('copyBtn');
        this.clearBtn = document.getElementById('clearBtn');
        
        // User Generator elements
        this.userForm = document.getElementById('userGeneratorForm');
        this.userQuantityInput = document.getElementById('userQuantity');
        this.userGenderSelect = document.getElementById('userGender');
        this.userNationalitySelect = document.getElementById('userNationality');
        this.userResultsContainer = document.getElementById('userResults');
        this.copyUserBtn = document.getElementById('copyUserBtn');
        this.clearUserBtn = document.getElementById('clearUserBtn');
        
        this.toast = document.getElementById('toast');
    }

    setupEventListeners() {
        // Tab switching
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });
        
        // CC Generator
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.binInput.addEventListener('input', () => this.handleBinInput());
        this.outputFormatSelect.addEventListener('change', () => this.handleFormatChange());
        this.copyBtn.addEventListener('click', () => this.copyResults());
        this.clearBtn.addEventListener('click', () => this.clearResults());
        
        // User Generator
        this.userForm.addEventListener('submit', (e) => this.handleUserSubmit(e));
        this.copyUserBtn.addEventListener('click', () => this.copyUserResults());
        this.clearUserBtn.addEventListener('click', () => this.clearUserResults());
    }

    switchTab(tabId) {
        this.tabBtns.forEach(btn => btn.classList.remove('active'));
        this.tabContents.forEach(content => content.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        const targetTab = document.getElementById(tabId);
        if (targetTab) {
            targetTab.classList.add('active');
        }
    }

    handleFormatChange() {
        const format = this.outputFormatSelect.value;
        this.detailedOptions.style.display = format === 'detailed' ? 'block' : 'none';
    }

    populateYearOptions() {
        const currentYear = new Date().getFullYear();
        for (let i = 0; i < 10; i++) {
            const year = currentYear + i;
            const option = document.createElement('option');
            option.value = year.toString();
            option.textContent = year.toString();
            this.expYearSelect.appendChild(option);
        }
    }

    handleBinInput() {
        const bin = this.binInput.value.replace(/\D/g, '');
        this.binInput.value = bin;
        
        if (bin.length >= 1) {
            const detectedType = this.detectCardType(bin);
            if (detectedType && this.cardTypeSelect.value === 'auto') {
                this.showToast(`Detected: ${detectedType.toUpperCase()}`, 'info');
            }
        }
    }

    detectCardType(number) {
        for (const [type, config] of Object.entries(this.cardTypes)) {
            for (const prefix of config.prefix) {
                if (number.startsWith(prefix)) {
                    return type;
                }
            }
        }
        return null;
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const bin = this.binInput.value.trim();
        const cardType = this.cardTypeSelect.value;
        const quantity = parseInt(this.quantityInput.value);
        const expMonth = this.expMonthSelect.value;
        const expYear = this.expYearSelect.value;
        const outputFormat = this.outputFormatSelect.value;
        const includeCvv = this.includeCvvCheckbox.checked;
        const includeExpiry = this.includeExpiryCheckbox.checked;
        const includeNames = this.includeNamesCheckbox.checked;

        if (quantity < 1 || quantity > 100) {
            this.showToast('Quantity must be between 1 and 100', 'error');
            return;
        }

        this.generateCards({
            bin, cardType, quantity, expMonth, expYear, 
            outputFormat, includeCvv, includeExpiry, includeNames
        });
    }

    generateCards(options) {
        const { bin, cardType, quantity, expMonth, expYear, outputFormat, includeCvv, includeExpiry, includeNames } = options;
        
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="material-icons">hourglass_empty</span>Generating...';
        submitBtn.disabled = true;

        setTimeout(() => {
            const cards = [];
            let validCount = 0;

            for (let i = 0; i < quantity; i++) {
                const card = this.generateSingleCard(bin, cardType);
                if (card) {
                    const cardData = {
                        number: card.number,
                        type: card.type,
                        cvv: includeCvv ? this.generateCvv(card.type) : null,
                        expiry: includeExpiry ? this.generateExpiry(expMonth, expYear) : null,
                        name: includeNames ? this.getRandomName() : null,
                        isValid: this.validateLuhn(card.number)
                    };
                    
                    if (cardData.isValid) validCount++;
                    cards.push(cardData);
                }
            }

            this.displayResults(cards, validCount, outputFormat);
            
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            this.showToast(`Generated ${cards.length} cards successfully!`);
        }, 500);
    }

    generateSingleCard(bin, cardType) {
        let selectedType = cardType;
        let cardNumber = bin;

        if (cardType === 'auto') {
            if (bin) {
                selectedType = this.detectCardType(bin) || 'visa';
            } else {
                const types = Object.keys(this.cardTypes);
                selectedType = types[Math.floor(Math.random() * types.length)];
            }
        }

        const typeConfig = this.cardTypes[selectedType];
        if (!typeConfig) return null;

        if (!bin) {
            const randomPrefix = typeConfig.prefix[Math.floor(Math.random() * typeConfig.prefix.length)];
            cardNumber = randomPrefix;
        }

        const targetLength = typeConfig.length[0]; // Use first valid length
        
        // Ensure we don't exceed target length
        while (cardNumber.length < targetLength - 1) {
            cardNumber += Math.floor(Math.random() * 10);
        }
        
        // Trim if too long
        if (cardNumber.length > targetLength - 1) {
            cardNumber = cardNumber.substring(0, targetLength - 1);
        }

        const checkDigit = this.calculateLuhnCheckDigit(cardNumber);
        cardNumber += checkDigit;

        return { number: cardNumber, type: selectedType };
    }

    calculateLuhnCheckDigit(number) {
        const digits = number.split('').map(Number);
        let sum = 0;
        let isEven = true;

        for (let i = digits.length - 1; i >= 0; i--) {
            let digit = digits[i];
            
            if (isEven) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            
            sum += digit;
            isEven = !isEven;
        }

        return (10 - (sum % 10)) % 10;
    }

    validateLuhn(number) {
        const digits = number.split('').map(Number);
        let sum = 0;
        let isEven = false;

        for (let i = digits.length - 1; i >= 0; i--) {
            let digit = digits[i];
            
            if (isEven) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            
            sum += digit;
            isEven = !isEven;
        }

        return sum % 10 === 0;
    }

    generateCvv(cardType) {
        const length = cardType === 'amex' ? 4 : 3;
        let cvv = '';
        for (let i = 0; i < length; i++) {
            cvv += Math.floor(Math.random() * 10);
        }
        return cvv;
    }

    generateExpiry(month, year) {
        let expMonth = month;
        let expYear = year;

        if (month === 'random') {
            expMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
        }

        if (year === 'random') {
            const currentYear = new Date().getFullYear();
            expYear = String(currentYear + Math.floor(Math.random() * 8) + 1); // 1-8 years from now
        }

        return { month: expMonth, year: expYear.slice(-2) };
    }

    getRandomName() {
        return this.names[Math.floor(Math.random() * this.names.length)];
    }

    displayResults(cards, validCount, outputFormat) {
        this.resultsContainer.innerHTML = '';
        
        if (cards.length === 0) {
            this.resultsContainer.innerHTML = `
                <div class="empty-state">
                    <span class="material-icons">error_outline</span>
                    <p>No cards could be generated</p>
                </div>
            `;
            return;
        }

        cards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card-item';
            
            if (outputFormat === 'pipe') {
                const expiry = card.expiry || { month: '12', year: '28' };
                const cvv = card.cvv || '123';
                const pipeFormat = `${card.number}|${expiry.month}|${expiry.year}|${cvv}`;
                
                cardElement.innerHTML = `
                    <div class="card-type-badge ${card.type}">${card.type.toUpperCase()}</div>
                    <div class="pipe-format">${pipeFormat}</div>
                `;
            } else {
                const formattedNumber = card.number.replace(/(.{4})/g, '$1 ').trim();
                let detailsHtml = '';
                if (card.expiry) detailsHtml += `<span>EXP: ${card.expiry.month}/${card.expiry.year}</span>`;
                if (card.cvv) detailsHtml += `<span>CVV: ${card.cvv}</span>`;
                if (card.name) detailsHtml += `<span>Name: ${card.name}</span>`;

                cardElement.innerHTML = `
                    <div class="card-type-badge ${card.type}">${card.type.toUpperCase()}</div>
                    <div class="card-number">${formattedNumber}</div>
                    ${detailsHtml ? `<div class="card-details">${detailsHtml}</div>` : ''}
                `;
            }

            this.resultsContainer.appendChild(cardElement);
        });

        this.generatedCountSpan.textContent = cards.length;
        this.validCountSpan.textContent = validCount;
        this.statsContainer.style.display = 'flex';
        this.copyBtn.disabled = false;
        this.clearBtn.disabled = false;
    }

    copyResults() {
        const cardItems = this.resultsContainer.querySelectorAll('.card-item');
        if (cardItems.length === 0) return;

        let text = '';
        cardItems.forEach(item => {
            const pipeElement = item.querySelector('.pipe-format');
            if (pipeElement) {
                text += `${pipeElement.textContent}\n`;
            } else {
                const number = item.querySelector('.card-number').textContent.replace(/\s/g, '');
                const details = item.querySelector('.card-details');
                
                if (details) {
                    const detailsText = Array.from(details.children)
                        .map(span => span.textContent)
                        .join(' | ');
                    text += `${number} | ${detailsText}\n`;
                } else {
                    text += `${number}\n`;
                }
            }
        });

        navigator.clipboard.writeText(text.trim()).then(() => {
            this.showToast('Copied to clipboard!');
        }).catch(() => {
            this.showToast('Failed to copy to clipboard', 'error');
        });
    }

    clearResults() {
        this.resultsContainer.innerHTML = `
            <div class="empty-state">
                <span class="material-icons">credit_card_off</span>
                <p>No cards generated yet</p>
            </div>
        `;
        
        this.statsContainer.style.display = 'none';
        this.copyBtn.disabled = true;
        this.clearBtn.disabled = true;
        this.showToast('Results cleared');
    }

    // User Generator Methods
    async handleUserSubmit(e) {
        e.preventDefault();
        
        const quantity = parseInt(this.userQuantityInput.value);
        const gender = this.userGenderSelect.value;
        const nationality = this.userNationalitySelect.value;

        if (quantity < 1 || quantity > 50) {
            this.showToast('Quantity must be between 1 and 50', 'error');
            return;
        }

        await this.generateUsers({ quantity, gender, nationality });
    }

    async generateUsers(options) {
        const { quantity, gender, nationality } = options;
        
        const submitBtn = this.userForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="material-icons">hourglass_empty</span>Generating...';
        submitBtn.disabled = true;

        try {
            const users = [];
            
            for (let i = 0; i < quantity; i++) {
                const user = await this.fetchRandomUser(gender, nationality);
                if (user) users.push(user);
            }

            this.displayUserResults(users);
            this.showToast(`Generated ${users.length} users successfully!`);
        } catch (error) {
            this.showToast('Failed to generate users', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async fetchRandomUser(gender, nationality) {
        try {
            let url = 'https://randomuser.me/api/';
            const params = new URLSearchParams();
            
            if (gender !== 'random') params.append('gender', gender);
            params.append('nat', nationality);
            
            if (params.toString()) url += '?' + params.toString();
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.results && data.results[0]) {
                const user = data.results[0];
                return {
                    name: `${user.name.first} ${user.name.last}`,
                    email: user.email,
                    phone: user.phone,
                    address: `${user.location.street.number} ${user.location.street.name}, ${user.location.city}, ${user.location.state} ${user.location.postcode}`,
                    country: user.location.country,
                    dob: new Date(user.dob.date).toLocaleDateString(),
                    gender: user.gender,
                    picture: user.picture.medium
                };
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        }
        return null;
    }

    displayUserResults(users) {
        this.userResultsContainer.innerHTML = '';
        
        if (users.length === 0) {
            this.userResultsContainer.innerHTML = `
                <div class="empty-state">
                    <span class="material-icons">error_outline</span>
                    <p>No users could be generated</p>
                </div>
            `;
            return;
        }

        users.forEach(user => {
            const userElement = document.createElement('div');
            userElement.className = 'user-item';
            
            userElement.innerHTML = `
                <div class="user-data">${user.name}</div>
                <div class="user-details">
                    <span>Email: ${user.email}</span>
                    <span>Phone: ${user.phone}</span>
                    <span>DOB: ${user.dob}</span>
                    <span>Gender: ${user.gender}</span>
                    <span>Country: ${user.country}</span>
                </div>
                <div class="user-details">
                    <span>Address: ${user.address}</span>
                </div>
            `;

            this.userResultsContainer.appendChild(userElement);
        });

        this.copyUserBtn.disabled = false;
        this.clearUserBtn.disabled = false;
    }

    copyUserResults() {
        const userItems = this.userResultsContainer.querySelectorAll('.user-item');
        if (userItems.length === 0) return;

        let text = '';
        userItems.forEach(item => {
            const name = item.querySelector('.user-data').textContent;
            const details = Array.from(item.querySelectorAll('.user-details span'))
                .map(span => span.textContent)
                .join(' | ');
            text += `${name} | ${details}\n`;
        });

        navigator.clipboard.writeText(text.trim()).then(() => {
            this.showToast('User data copied to clipboard!');
        }).catch(() => {
            this.showToast('Failed to copy to clipboard', 'error');
        });
    }

    clearUserResults() {
        this.userResultsContainer.innerHTML = `
            <div class="empty-state">
                <span class="material-icons">person_off</span>
                <p>No users generated yet</p>
            </div>
        `;
        
        this.copyUserBtn.disabled = true;
        this.clearUserBtn.disabled = true;
        this.showToast('User results cleared');
    }

    showToast(message, type = 'success') {
        this.toast.textContent = message;
        this.toast.className = `toast ${type}`;
        this.toast.classList.add('show');

        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CCGenerator();
});