import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { useLocation, useParams, Link } from 'react-router-dom';

// This component will help debug routing issues
function RouteDebugger() {
    const location = useLocation();
    const params = useParams();

    return (
        <div style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            maxWidth: '400px',
            zIndex: 9999
        }}>
            <h4>Route Debugger</h4>
            <p><strong>Current Path:</strong> {location.pathname}</p>
            <p><strong>Parameters:</strong> {JSON.stringify(params)}</p>
        </div>
    );
}

// This component can be temporarily added to your App.js
export function DebugProvider({ children }) {
    return (
        <>
            {children}
            <RouteDebugger />
        </>
    );
}

// Example of how to set up a test route component
export function TestRouteComponent() {
    const params = useParams();
    return (
        <div style={{ padding: '20px' }}>
            <h2>Test Route Component</h2>
            <p>This is a test component to verify routing works.</p>
            <p>Params: {JSON.stringify(params)}</p>
            <Link to="/admin/dashboard/exams">Back to exams list</Link>
        </div>
    );
}

// Use this in your App.js to test routes
export function DebugRoutes() {
    return (
        <Routes>
            <Route path="/test" element={<TestRouteComponent />} />
            <Route path="/test/:id" element={<TestRouteComponent />} />
        </Routes>
    );
}
