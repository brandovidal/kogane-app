import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Palette, Shapes, Tags } from "lucide-react";
import { ResponsiveDialog } from "@/shared/components/dialogs/ResponsiveDialog";
import { FieldLabel } from "@/shared/components/forms/FieldLabel";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { z } from "zod";
import { useSaveCategory } from "@/shared/api/hooks/catalogs";
import type { Category } from "@/shared/api/types";
import { CategoryIconPicker } from "@/features/categories/components/CategoryIconPicker";

const categoryFormSchema = z.object({
  name: z.string().trim().min(1, "Nombre requerido").max(40),
  color: z.string().trim().max(20),
  icon: z.string().trim().max(40).nullable(),
  isDefault: z.boolean(),
});
type CreateCategory = z.infer<typeof categoryFormSchema>;

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category;
}

export function CategoryDialog({ open, onOpenChange, category }: CategoryDialogProps) {
  const saveCategory = useSaveCategory();
  const isEdit = !!category;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CreateCategory>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      color: "#6B7280",
      icon: null,
      isDefault: false,
    },
  });

  useEffect(() => {
    if (open && category) {
      reset({
        name: category.name,
        color: category.color,
        icon: category.icon,
        isDefault: category.isDefault,
      });
    } else if (open) {
      reset({
        name: "",
        color: "#6B7280",
        icon: null,
        isDefault: false,
      });
    }
  }, [open, category, reset]);

  const onSubmit = (data: CreateCategory) => {
    saveCategory.mutate(
      { ...data, icon: data.icon || null, id: category?.id },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={category?.isDefault ? "Personalizar categoría" : isEdit ? "Editar categoría" : "Nueva categoría"}
      icon={<Tags className="size-4 text-primary" />}
      description={category?.isDefault ? "Las categorías predeterminadas conservan su nombre y color; puedes elegirles un icono." : isEdit ? "Modifica los datos de la categoría" : "Crea una nueva categoría para clasificar gastos"}
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={saveCategory.isPending}>
            {isEdit ? category?.isDefault ? "Guardar icono" : "Guardar" : "Crear"}
          </Button>
        </>
      }
    >
      <form className="space-y-4 py-2" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-1.5">
          <label className="text-sm font-medium"><FieldLabel icon={Tags}>Nombre *</FieldLabel></label>
          <Input {...register("name")} placeholder="Ej: Transporte, Comida..." readOnly={category?.isDefault} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium"><FieldLabel icon={Palette}>Color</FieldLabel></label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={watch("color")}
                onChange={(e) => setValue("color", e.target.value)}
                disabled={category?.isDefault}
                className="h-9 w-12 cursor-pointer rounded border"
              />
              <Input {...register("color")} className="flex-1" readOnly={category?.isDefault} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium"><FieldLabel icon={Shapes}>Icono (opcional)</FieldLabel></label>
            <CategoryIconPicker
              value={watch("icon")}
              color={watch("color")}
              onChange={(icon) => setValue("icon", icon)}
            />
          </div>
        </div>
      </form>
    </ResponsiveDialog>
  );
}
