// src/app/services/Category.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FirebaseService } from '../firebase.service';
import { Category } from '../../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  constructor(private firebase: FirebaseService) {}

  getCategories(): Observable<Category[]> {
    return this.firebase.getCollection<Category>('Categories');
  }

  addCategory(Category: Category) {
    return this.firebase.add<Category>('Categories', Category);
  }
}
