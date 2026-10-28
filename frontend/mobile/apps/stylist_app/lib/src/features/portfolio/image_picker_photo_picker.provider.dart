import 'package:image_picker/image_picker.dart';

import 'package:stylist_app/src/features/portfolio/photo_picker.provider.dart';

class ImagePickerPhotoPicker implements PhotoPicker {
  const ImagePickerPhotoPicker();

  @override
  Future<String?> pickPhoto() async {
    final image = await ImagePicker().pickImage(source: ImageSource.gallery);
    return image?.path;
  }
}
