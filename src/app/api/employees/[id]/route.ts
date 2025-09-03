import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { calculateVacationDays } from '@/lib/calculations';

interface RouteParams {
    params: {
        id: string;
    };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const employeeId = parseInt(params.id);

        if (isNaN(employeeId)) {
            return NextResponse.json(
                { message: 'Invalid employee ID' },
                { status: 400 }
            );
        }

        const employee = db.getEmployee(employeeId);
        if (!employee) {
            return NextResponse.json(
                { message: 'Employee not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            ...employee,
            vacation: calculateVacationDays(employee)
        });
    } catch (error) {
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const employeeId = parseInt(params.id);

        if (isNaN(employeeId)) {
            return NextResponse.json(
                { message: 'Invalid employee ID' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const updatedEmployee = db.updateEmployee(employeeId, body);

        if (!updatedEmployee) {
            return NextResponse.json(
                { message: 'Employee not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedEmployee);
    } catch (error) {
        return NextResponse.json(
            { message: 'Invalid employee data' },
            { status: 400 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const employeeId = parseInt(params.id);

        if (isNaN(employeeId)) {
            return NextResponse.json(
                { message: 'Invalid employee ID' },
                { status: 400 }
            );
        }

        const deleted = db.deleteEmployee(employeeId);
        if (!deleted) {
            return NextResponse.json(
                { message: 'Employee not found' },
                { status: 404 }
            );
        }

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}