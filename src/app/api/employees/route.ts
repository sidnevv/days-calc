import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { calculateVacationDaysSimple } from '@/lib/calculations';

export async function GET() {
    try {
        const employees = db.getEmployees().map(employee => ({
            ...employee,
            vacation: calculateVacationDaysSimple(employee)
        }));

        return NextResponse.json(employees);
    } catch (error) {
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Добавляем текущую позицию в историю при создании
        const positionChange = {
            fromDate: body.hireDate || new Date().toISOString().split('T')[0],
            toDate: null,
            position: body.position,
            vacationDaysPerYear: body.vacationDaysPerYear || 28
        };

        const employeeData = {
            ...body,
            positionChanges: [positionChange]
        };

        const newEmployee = db.addEmployee(employeeData);

        return NextResponse.json({
            ...newEmployee,
            vacation: calculateVacationDaysSimple(newEmployee)
        }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { message: 'Invalid employee data' },
            { status: 400 }
        );
    }
}