/*
 * Mawjood sample data layer
 * ------------------------
 * This file provides the front-end demo data used by the Mawjood pages.
 * All pharmacy inventory, prices, opening hours, distances, and update times
 * are illustrative placeholders. Replace this data with an API/database before
 * using the website for real medicine availability.
 *
 * Public API: window.MawjoodData
 *   .medicines                 Array of medicine records
 *   .pharmacies                Array of pharmacy records
 *   .inventory                 Array linking medicines to pharmacies
 *   .searchMedicines(query)    Search medicine names and ingredients
 *   .getMedicineById(id)       Find one medicine by its ID
 *   .getPharmacyById(id)       Find one pharmacy by its ID
 *   .getInventoryForMedicine(id)
 *   .getInventoryForPharmacy(id)
 *   .searchInventory(query, filters)
 */
(function (window) {
  'use strict';

  // Medicine catalogue for the demonstration website.
  var medicines = [
    {
      id: 'panadol-extra-500',
      name: 'Panadol Extra 500 mg',
      brand: 'Panadol',
      activeIngredients: ['Paracetamol', 'Caffeine'],
      strength: '500 mg',
      form: 'Tablets',
      packSize: '24 tablets',
      requiresPrescription: false,
      category: 'Pain relief',
      description: 'A sample catalogue entry for a paracetamol and caffeine product.',
      genericMedicineId: null // Paracetamol alone lacks the caffeine component.
    },
    {
      id: 'paracetamol-500',
      name: 'Paracetamol 500 mg',
      brand: 'Generic',
      activeIngredients: ['Paracetamol'],
      strength: '500 mg',
      form: 'Tablets',
      packSize: '24 tablets',
      requiresPrescription: false,
      category: 'Pain relief',
      description: 'A sample generic paracetamol catalogue entry.',
      genericMedicineId: null
    },
    {
      id: 'augmentin-625',
      name: 'Augmentin 625 mg',
      brand: 'Augmentin',
      activeIngredients: ['Amoxicillin', 'Clavulanic acid'],
      strength: '625 mg',
      form: 'Tablets',
      packSize: '14 tablets',
      requiresPrescription: true,
      category: 'Antibiotic',
      description: 'Sample catalogue entry. Antibiotics should be used only as prescribed.',
      genericMedicineId: null
    },
    {
      id: 'ventolin-inhaler',
      name: 'Ventolin Inhaler',
      brand: 'Ventolin',
      activeIngredients: ['Salbutamol'],
      strength: '100 micrograms per actuation',
      form: 'Metered-dose inhaler',
      packSize: '1 inhaler',
      requiresPrescription: true,
      category: 'Respiratory',
      description: 'A sample catalogue entry for a salbutamol inhaler.',
      genericMedicineId: null
    },
    {
      id: 'insulin-glargine',
      name: 'Insulin Glargine',
      brand: 'Multiple brands',
      activeIngredients: ['Insulin glargine'],
      strength: '100 units/mL',
      form: 'Injection',
      packSize: 'Pen or vial; confirm presentation',
      requiresPrescription: true,
      category: 'Diabetes care',
      description: 'Sample catalogue entry. Confirm the exact product and storage requirements with a pharmacist.',
      genericMedicineId: null
    },
    {
      id: 'saline-nasal-spray',
      name: 'Saline Nasal Spray 0.9%',
      brand: 'Multiple brands',
      activeIngredients: ['Sodium chloride'],
      strength: '0.9%',
      form: 'Nasal spray',
      packSize: '1 bottle',
      requiresPrescription: false,
      category: 'Cold and allergy care',
      description: 'A sample catalogue entry for a saline nasal spray.',
      genericMedicineId: null
    },
    {
      id: 'vitamin-c-500',
      name: 'Vitamin C 500 mg',
      brand: 'Multiple brands',
      activeIngredients: ['Ascorbic acid'],
      strength: '500 mg',
      form: 'Tablets',
      packSize: '30 tablets',
      requiresPrescription: false,
      category: 'Vitamins',
      description: 'A sample vitamin catalogue entry.',
      genericMedicineId: null
    }
  ];

  // Sample pharmacies around Amman. Phone numbers and inventory are placeholders.
  var pharmacies = [
    {
      id: 'al-shifa-abdoun',
      name: 'Al-Shifa Pharmacy',
      area: 'Abdoun',
      city: 'Amman',
      country: 'Jordan',
      address: 'Abdoun, Amman, Jordan',
      distanceKm: 0.8,
      phone: '+96260000001',
      hoursText: 'Open until 12:00 am',
      isOpen: true,
      latitude: 31.9539,
      longitude: 35.8739,
      mapsUrl: 'https://maps.google.com/?q=Al-Shifa+Pharmacy+Abdoun+Amman',
      pageUrl: 'pharmacy.html'
    },
    {
      id: 'dar-al-dawa-jabal-amman',
      name: 'Dar Al-Dawa Pharmacy',
      area: 'Jabal Amman',
      city: 'Amman',
      country: 'Jordan',
      address: 'Jabal Amman, Amman, Jordan',
      distanceKm: 1.4,
      phone: '+96260000002',
      hoursText: 'Open until 11:00 pm',
      isOpen: true,
      latitude: 31.9454,
      longitude: 35.9284,
      mapsUrl: 'https://maps.google.com/?q=Dar+Al-Dawa+Pharmacy+Amman',
      pageUrl: 'pharmacy.html'
    },
    {
      id: 'al-razi-sweifieh',
      name: 'Al-Razi Pharmacy',
      area: 'Sweifieh',
      city: 'Amman',
      country: 'Jordan',
      address: 'Sweifieh, Amman, Jordan',
      distanceKm: 2.1,
      phone: '+96260000003',
      hoursText: 'Open 24 hours',
      isOpen: true,
      latitude: 31.9571,
      longitude: 35.8582,
      mapsUrl: 'https://maps.google.com/?q=Al-Razi+Pharmacy+Amman',
      pageUrl: 'pharmacy.html'
    },
    {
      id: 'al-noor-amman',
      name: 'Al-Noor Pharmacy',
      area: 'Khalda',
      city: 'Amman',
      country: 'Jordan',
      address: 'Khalda, Amman, Jordan',
      distanceKm: 4.6,
      phone: '+96260000004',
      hoursText: 'Open until 10:00 pm',
      isOpen: false,
      latitude: 31.9994,
      longitude: 35.8417,
      mapsUrl: 'https://maps.google.com/?q=Al-Noor+Pharmacy+Amman',
      pageUrl: 'pharmacy.html'
    }
  ];

  // Inventory joins a medicine to a pharmacy. Stock values: in, low, out.
  var inventory = [
    { id: 'stock-001', medicineId: 'panadol-extra-500', pharmacyId: 'al-shifa-abdoun', status: 'in', quantity: 18, priceJod: 2.25, updatedMinutesAgo: 12 },
    { id: 'stock-002', medicineId: 'panadol-extra-500', pharmacyId: 'dar-al-dawa-jabal-amman', status: 'low', quantity: 3, priceJod: 2.30, updatedMinutesAgo: 25 },
    { id: 'stock-003', medicineId: 'panadol-extra-500', pharmacyId: 'al-razi-sweifieh', status: 'in', quantity: 14, priceJod: 2.20, updatedMinutesAgo: 60 },
    { id: 'stock-004', medicineId: 'paracetamol-500', pharmacyId: 'al-shifa-abdoun', status: 'in', quantity: 35, priceJod: 0.85, updatedMinutesAgo: 18 },
    { id: 'stock-005', medicineId: 'paracetamol-500', pharmacyId: 'dar-al-dawa-jabal-amman', status: 'in', quantity: 20, priceJod: 0.90, updatedMinutesAgo: 42 },
    { id: 'stock-006', medicineId: 'paracetamol-500', pharmacyId: 'al-razi-sweifieh', status: 'in', quantity: 12, priceJod: 0.80, updatedMinutesAgo: 75 },
    { id: 'stock-007', medicineId: 'augmentin-625', pharmacyId: 'al-shifa-abdoun', status: 'low', quantity: 2, priceJod: 6.50, updatedMinutesAgo: 35 },
    { id: 'stock-008', medicineId: 'augmentin-625', pharmacyId: 'al-razi-sweifieh', status: 'in', quantity: 8, priceJod: 6.40, updatedMinutesAgo: 55 },
    { id: 'stock-009', medicineId: 'ventolin-inhaler', pharmacyId: 'dar-al-dawa-jabal-amman', status: 'in', quantity: 7, priceJod: 3.10, updatedMinutesAgo: 20 },
    { id: 'stock-010', medicineId: 'ventolin-inhaler', pharmacyId: 'al-noor-amman', status: 'out', quantity: 0, priceJod: 3.20, updatedMinutesAgo: 120 },
    { id: 'stock-011', medicineId: 'insulin-glargine', pharmacyId: 'al-razi-sweifieh', status: 'in', quantity: 4, priceJod: 18.00, updatedMinutesAgo: 30 },
    { id: 'stock-012', medicineId: 'saline-nasal-spray', pharmacyId: 'al-shifa-abdoun', status: 'in', quantity: 16, priceJod: 1.25, updatedMinutesAgo: 15 },
    { id: 'stock-013', medicineId: 'saline-nasal-spray', pharmacyId: 'al-noor-amman', status: 'in', quantity: 10, priceJod: 1.20, updatedMinutesAgo: 90 },
    { id: 'stock-014', medicineId: 'vitamin-c-500', pharmacyId: 'dar-al-dawa-jabal-amman', status: 'in', quantity: 22, priceJod: 2.00, updatedMinutesAgo: 48 },
    { id: 'stock-015', medicineId: 'vitamin-c-500', pharmacyId: 'al-razi-sweifieh', status: 'low', quantity: 2, priceJod: 1.95, updatedMinutesAgo: 80 }
  ];

  // Normalize user-entered text so searches are case-insensitive and whitespace-safe.
  function normalize(value) {
    return String(value == null ? '' : value).trim().toLowerCase();
  }

  // Return catalogue records whose name, brand, ingredient, strength, or category matches.
  function searchMedicines(query) {
    var term = normalize(query);
    if (!term) return medicines.slice();

    return medicines.filter(function (medicine) {
      var searchableText = [
        medicine.name,
        medicine.brand,
        medicine.strength,
        medicine.form,
        medicine.category
      ].concat(medicine.activeIngredients || []).join(' ').toLowerCase();

      return searchableText.indexOf(term) !== -1;
    });
  }

  // Find one medicine by its stable ID; return null if it does not exist.
  function getMedicineById(id) {
    return medicines.find(function (medicine) {
      return medicine.id === id;
    }) || null;
  }

  // Find one pharmacy by its stable ID; return null if it does not exist.
  function getPharmacyById(id) {
    return pharmacies.find(function (pharmacy) {
      return pharmacy.id === id;
    }) || null;
  }

  // Return inventory rows for a medicine, enriched with pharmacy details.
  function getInventoryForMedicine(medicineId) {
    return inventory.filter(function (item) {
      return item.medicineId === medicineId;
    }).map(function (item) {
      return Object.assign({}, item, {
        medicine: getMedicineById(item.medicineId),
        pharmacy: getPharmacyById(item.pharmacyId)
      });
    });
  }

  // Return inventory rows for a pharmacy, enriched with medicine details.
  function getInventoryForPharmacy(pharmacyId) {
    return inventory.filter(function (item) {
      return item.pharmacyId === pharmacyId;
    }).map(function (item) {
      return Object.assign({}, item, {
        medicine: getMedicineById(item.medicineId),
        pharmacy: getPharmacyById(item.pharmacyId)
      });
    });
  }

  // Search stock by medicine name/ingredient, with optional area and stock filters.
  function searchInventory(query, filters) {
    var term = normalize(query);
    var options = filters || {};

    return inventory.filter(function (item) {
      var medicine = getMedicineById(item.medicineId);
      var pharmacy = getPharmacyById(item.pharmacyId);
      if (!medicine || !pharmacy) return false;

      var matchesTerm = !term || normalize([
        medicine.name,
        medicine.brand,
        medicine.category
      ].concat(medicine.activeIngredients || []).join(' ')).indexOf(term) !== -1;
      var matchesArea = !options.area || normalize(pharmacy.area) === normalize(options.area);
      var matchesStock = !options.inStockOnly || item.status === 'in';
      var matchesOpen = !options.openNowOnly || pharmacy.isOpen;
      var maxDistance = Number(options.maxDistanceKm);
      var matchesDistance = options.maxDistanceKm == null || options.maxDistanceKm === '' ||
        !Number.isFinite(maxDistance) || pharmacy.distanceKm <= maxDistance;

      return matchesTerm && matchesArea && matchesStock && matchesOpen && matchesDistance;
    }).map(function (item) {
      return Object.assign({}, item, {
        medicine: getMedicineById(item.medicineId),
        pharmacy: getPharmacyById(item.pharmacyId)
      });
    }).sort(function (a, b) {
      // Prioritize available stock, then nearby pharmacies.
      if (a.status !== b.status) {
        if (a.status === 'in') return -1;
        if (b.status === 'in') return 1;
        if (a.status === 'low') return -1;
        if (b.status === 'low') return 1;
      }
      return a.pharmacy.distanceKm - b.pharmacy.distanceKm;
    });
  }

  // Expose one namespaced global to avoid adding many variables to window.
  window.MawjoodData = {
    medicines: medicines,
    pharmacies: pharmacies,
    inventory: inventory,
    searchMedicines: searchMedicines,
    getMedicineById: getMedicineById,
    getPharmacyById: getPharmacyById,
    getInventoryForMedicine: getInventoryForMedicine,
    getInventoryForPharmacy: getInventoryForPharmacy,
    searchInventory: searchInventory
  };
})(window);
