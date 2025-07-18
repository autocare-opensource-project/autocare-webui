
import { http, HttpResponse } from 'msw';

import type { Appointment, Car, Customer, PaginatedResponse, Service, User } from '@/types';

function getPersistedCustomers(): Customer[] {
  const stored = sessionStorage.getItem('mockCustomers');
  if (stored) {
    return JSON.parse(stored);
  }
  
  return [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@email.com',
      phone: '555-0123',
      address: '123 Main St',
      city: 'Springfield',
      zipCode: '12345',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@email.com',
      phone: '555-0456',
      address: '456 Oak Ave',
      city: 'Springfield',
      zipCode: '12345',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z'
    },
  ];
}

function saveCustomers(customers: Customer[]): void {
  sessionStorage.setItem('mockCustomers', JSON.stringify(customers));
}

function getPersistedCars(): Car[] {
  const stored = sessionStorage.getItem('mockCars');
  if (stored) {
    return JSON.parse(stored);
  }
  return [
    {
      id: '1',
      customerId: '1',
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      vin: '1HGBH41JXMN109186',
      licensePlate: 'ABC123',
      color: 'Silver',
      mileage: 45000,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      customer: mockCustomers[0]
    },
    {
      id: '2',
      customerId: '2',
      make: 'Honda',
      model: 'Civic',
      year: 2019,
      vin: '2HGFC2F59KH123456',
      licensePlate: 'XYZ789',
      color: 'Blue',
      mileage: 32000,
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      customer: mockCustomers[1]
    }
  ];
}

function saveCars(cars: Car[]): void {
  sessionStorage.setItem('mockCars', JSON.stringify(cars));
}

// Initialize with persisted data
let mockCustomers: Customer[] = getPersistedCustomers();
let mockCars: Car[] = getPersistedCars();

const mockAppointments: Appointment[] = [
  {
    id: '1',
    customerId: '1',
    carId: '1',
    mechanicId: '1',
    serviceType: 'Oil Change',
    description: 'Regular oil change and filter replacement',
    scheduledDate: new Date().toISOString(),
    status: 'SCHEDULED',
    estimatedDuration: 60,
    estimatedCost: 50,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    customer: mockCustomers[0],
    car: mockCars[0]
  },
  {
    id: '2',
    customerId: '2',
    carId: '2',
    serviceType: 'Brake Inspection',
    description: 'Complete brake system inspection',
    scheduledDate: new Date(Date.now() + 86400000).toISOString(),
    status: 'SCHEDULED',
    estimatedDuration: 90,
    estimatedCost: 120,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    customer: mockCustomers[1],
    car: mockCars[1]
  }
];

const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@autocare.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

const mockServices: Service[] = [
  {
    id: '1',
    name: 'Oil Change',
    description: 'Regular oil change and filter replacement',
    estimatedDuration: 60,
    basePrice: 50,
    category: 'Maintenance',
    isActive: true
  },
  {
    id: '2',
    name: 'Brake Inspection',
    description: 'Complete brake system inspection',
    estimatedDuration: 90,
    basePrice: 120,
    category: 'Safety',
    isActive: true
  }
];

export const handlers = [
  // Customers
  http.get('/api/customers', () => {
    // Always read the most recent data
    mockCustomers = getPersistedCustomers();
    const response: PaginatedResponse<Customer> = {
      data: mockCustomers,
      total: mockCustomers.length,
      page: 1,
      limit: 10,
      totalPages: 1
    };
    return HttpResponse.json(response);
  }),

  http.get('/api/customers/:id', ({ params }) => {
    mockCustomers = getPersistedCustomers();
    const customer = mockCustomers.find(c => c.id === params.id);
    if (!customer) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json({ data: customer, success: true });
  }),

  http.post('/api/customers', async ({ request }) => {
    const body = await request.json();
    mockCustomers = getPersistedCustomers();
    const newCustomer: Customer = {
      id: String(mockCustomers.length + 1),
      ...(body as any),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockCustomers.push(newCustomer);
    // Save after adding
    saveCustomers(mockCustomers);
    return HttpResponse.json({ data: newCustomer, success: true });
  }),
  
  http.delete('/api/customers/:id', ({ params }) => {
    const { id } = params;
    mockCustomers = getPersistedCustomers();

    const customerIndex = mockCustomers.findIndex(customer => customer.id === id);

    if (customerIndex > -1) {
      mockCustomers.splice(customerIndex, 1);
      
      // Backup after deletion
      saveCustomers(mockCustomers);

      return new HttpResponse(null, { status: 204 });
    } else {
      return new HttpResponse(null, { status: 404, statusText: 'Customer not found' });
    }
  }),

  // Cars
  http.get('/api/cars', () => {
    mockCars = getPersistedCars();
    const response: PaginatedResponse<Car> = {
      data: mockCars,
      total: mockCars.length,
      page: 1,
      limit: 10,
      totalPages: 1
    };
    return HttpResponse.json(response);
  }),

  http.post('/api/cars', async ({ request }) => {
    const body = await request.json();
    mockCars = getPersistedCars();
    mockCustomers = getPersistedCustomers();
    const customer = mockCustomers.find(c => c.id === (body as any).customerId);
    const newCar: Car = {
      id: String(mockCars.length + 1),
      ...(body as any),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customer
    };
    mockCars.push(newCar);
    // Save after adding
    saveCars(mockCars);
    return HttpResponse.json({ data: newCar, success: true });
  }),

  // Appointments
  http.get('/api/appointments', () => {
    const response: PaginatedResponse<Appointment> = {
      data: mockAppointments,
      total: mockAppointments.length,
      page: 1,
      limit: 10,
      totalPages: 1
    };
    return HttpResponse.json(response);
  }),

  http.post('/api/appointments', async ({ request }) => {
    const body = await request.json();
    mockCustomers = getPersistedCustomers();
    mockCars = getPersistedCars();
    const customer = mockCustomers.find(c => c.id === (body as any).customerId);
    const car = mockCars.find(c => c.id === (body as any).carId);
    const newAppointment: Appointment = {
      id: String(mockAppointments.length + 1),
      ...(body as any),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customer,
      car
    };
    mockAppointments.push(newAppointment);
    return HttpResponse.json({ data: newAppointment, success: true });
  }),

  // Users
  http.get('/api/users', () => {
    const response: PaginatedResponse<User> = {
      data: mockUsers,
      total: mockUsers.length,
      page: 1,
      limit: 10,
      totalPages: 1
    };
    return HttpResponse.json(response);
  }),

  http.get('/api/users', ({ request }) => {
    const url = new URL(request.url);
    const role = url.searchParams.get('role');

    let filteredUsers = mockUsers;
    if (role) {
      filteredUsers = mockUsers.filter(user => user.role === role);
    }

    return HttpResponse.json({ data: filteredUsers, success: true });
  }),

  // Services
  http.get('/api/services', () => {
    const response: PaginatedResponse<Service> = {
      data: mockServices,
      total: mockServices.length,
      page: 1,
      limit: 10,
      totalPages: 1
    };
    return HttpResponse.json(response);
  }),

  // Authentication
  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };

    if (body.email === 'admin@autocare.com' && body.password === 'password') {
      const user: User = {
        id: '1',
        email: 'admin@autocare.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };

      return HttpResponse.json({
        data: {
          user,
          token: 'mock-jwt-token-' + Date.now()
        },
        success: true
      });
    }

    return new HttpResponse(JSON.stringify({ message: 'Invalid credentials' }), { status: 401 });
  }),

  http.post('/api/auth/register', async ({ request }) => {
    const body = (await request.json()) as {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      role: string;
    };

    const newUser: User = {
      id: String(Date.now()),
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      role: body.role as 'ADMIN' | 'MECHANIC' | 'CUSTOMER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return HttpResponse.json({
      data: {
        user: newUser,
        token: 'mock-jwt-token-' + Date.now()
      },
      success: true
    });
  })
];



