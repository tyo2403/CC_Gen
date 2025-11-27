class CCGenerator {
    static CARD_TYPES = {
        visa: { prefix: ['4'], length: [16] },
        mastercard: { prefix: ['5'], length: [16] },
        amex: { prefix: ['34', '37'], length: [15] },
        discover: { prefix: ['6'], length: [16] }
    };

    static NAMES = [
        'John Smith', 'Jane Doe', 'Michael Johnson', 'Sarah Williams', 'David Brown',
        'Emily Davis', 'Christopher Miller', 'Ashley Wilson', 'Matthew Moore', 'Jessica Taylor'
    ];

    constructor() {
        this.cardTypes = CCGenerator.CARD_TYPES;
        this.names = CCGenerator.NAMES;
        this.initializeElements();
        this.setupEventListeners();
        this.populateYearOptions();
    }
    // ...rest of code unchanged
}
