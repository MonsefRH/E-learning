from sqlalchemy.orm import Session
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from fastapi import HTTPException, status

def get_category_by_id(db: Session, category_id: int) -> Category | None:
    return db.query(Category).filter(Category.id == category_id).first()

def get_categories(db: Session, include_subcategories: bool = True) -> list[CategoryResponse]:
    query = db.query(Category).filter(Category.parent_id == None) if not include_subcategories else db.query(Category)
    return [CategoryResponse.from_orm(category) for category in query.all()]

def create_category(db: Session, category: CategoryCreate) -> CategoryResponse:
    if category.parent_id and not get_category_by_id(db, category.parent_id):
        raise HTTPException(status_code=400, detail="Invalid parent_id")
    db_category = Category(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return CategoryResponse.from_orm(db_category)

def update_category(db: Session, category_id: int, category_update: CategoryUpdate) -> CategoryResponse:
    db_category = get_category_by_id(db, category_id)
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    if category_update.parent_id and not get_category_by_id(db, category_update.parent_id):
        raise HTTPException(status_code=400, detail="Invalid parent_id")
    update_data = category_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_category, key, value)
    db.commit()
    db.refresh(db_category)
    return CategoryResponse.from_orm(db_category)

def delete_category(db: Session, category_id: int):
    db_category = get_category_by_id(db, category_id)
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(db_category)
    db.commit()