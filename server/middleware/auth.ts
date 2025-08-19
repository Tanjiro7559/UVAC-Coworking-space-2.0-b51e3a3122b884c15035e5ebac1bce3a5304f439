import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
      };
    }
  }
}

interface JwtPayload {
  userId: string;
  role: string;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No or invalid Bearer token provided:', authHeader);
      return res.status(401).json({ 
        error: 'No token provided',
        details: 'Authorization header must contain Bearer token'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      console.log('Invalid token format');
      return res.status(401).json({ 
        error: 'Invalid token format',
        details: 'Token not found after Bearer prefix'
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET not set in environment variables');
      return res.status(500).json({ 
        error: 'Internal server error',
        details: 'JWT_SECRET environment variable is not set'
      });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
      
      // Validate userId and role
      if (!decoded.userId || !decoded.role) {
        console.error('Invalid token payload:', decoded);
        return res.status(401).json({ 
          error: 'Invalid token',
          details: 'Token payload missing userId or role'
        });
      }
      
      // Add role to request
      req.user = {
        userId: decoded.userId,
        role: decoded.role
      };
      
      // Check if route requires admin access
      const isAdminRoute = req.path.startsWith('/admin') || 
                           req.path.startsWith('/dashboard/inquiries');
      
      if (isAdminRoute && decoded.role !== 'admin') {
        return res.status(403).json({
          error: 'Access denied',
          details: 'Admin access required'
        });
      }
      
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ 
          error: 'Invalid or expired token',
          details: error.message
        });
      }
      return res.status(500).json({ 
        error: 'Internal server error',
        details: 'Failed to verify token'
      });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: 'Failed to authenticate request'
    });
  }
};
