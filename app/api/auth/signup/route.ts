import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { PrismaClient, Prisma, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    console.log('🚀 Début de la requête d\'inscription');

    const body = await req.json();
    console.log('📝 Données reçues:', {
      ...body,
      password: '[MASQUÉ]'
    });

    const { name, email, password, role } = body;

    // Validation
    if (!name || !email || !password || !role) {
      console.log('❌ Données manquantes');
      return NextResponse.json(
        { success: false, message: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // Vérification de l'email existant
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('❌ Email déjà utilisé');
      return NextResponse.json(
        { success: false, message: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }

    // Hashage du mot de passe
    const hashedPassword = await hash(password, 12);

    // Création de l'utilisateur
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as UserRole,
        profile: role === 'CONCIERGE' ? {
          create: {
            rating: 0,
            isVerified: false,
          }
        } : undefined
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    console.log('✅ Utilisateur créé avec succès');

    return NextResponse.json(
      { success: true, user },
      { status: 201 }
    );

  } catch (error) {
    console.error('🔥 Erreur lors de la création du compte:', error);

    // Gestion spécifique des erreurs Prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      let message = 'Erreur lors de la création du compte';
      
      switch (error.code) {
        case 'P2002':
          message = 'Cet email est déjà utilisé';
          break;
        case 'P2000':
          message = 'Les données fournies sont invalides';
          break;
        default:
          message = `Erreur base de données: ${error.code}`;
      }

      return NextResponse.json(
        { success: false, message, code: error.code },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: 'Erreur serveur lors de la création du compte',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}